import { before, beforeEach, after, test } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import { MongoMemoryReplSet } from 'mongodb-memory-server'
import request from 'supertest'
import jwt from 'jsonwebtoken'
import { hash } from 'argon2'
import { spawnSync } from 'node:child_process'
import { createApp } from '../configs/server.js'
import User from '../src/user/user.model.js'
import Course from '../src/courses/courses.model.js'

process.env.NODE_ENV = 'test'
process.env.SECRETORPRIVATEKEY = 'only-synthetic-test-signing-key-32-characters'
let replica, app, student, teacher, otherTeacher, otherStudent, courses, password
const token = user => jwt.sign({ uid: user.id }, process.env.SECRETORPRIVATEKEY, { expiresIn: '1h' })
const authorization = user => `Bearer ${token(user)}`
const prefix = '/gestionSystem/v1'

before(async () => {
    replica = await MongoMemoryReplSet.create({ binary: { version: process.env.MONGOMS_VERSION || '8.0.17' }, replSet: { count: 1, storageEngine: 'wiredTiger' }, instanceOpts: [{ launchTimeout: 60000 }] })
    await mongoose.connect(replica.getUri(), { dbName: 'students_test' })
    await User.init(); await Course.init()
    password = await hash('TestOnly!2026')
    app = createApp()
}, { timeout: 180000 })
beforeEach(async () => {
    await Course.deleteMany({}); await User.deleteMany({})
    const makeUser = (username, role) => User.create({ name: username, username, email: `${username}@example.test`, phone: '55550000', password, role })
    teacher = await makeUser('teacher_one', 'TEACHER_ROLE')
    otherTeacher = await makeUser('teacher_two', 'TEACHER_ROLE')
    student = await makeUser('student_one', 'STUDENT_ROLE')
    otherStudent = await makeUser('student_two', 'STUDENT_ROLE')
    courses = await Course.create(Array.from({ length: 5 }, (_, index) => ({ name: `Course ${index}`, description: 'Synthetic course', teacher: teacher._id })))
})
after(async () => { await mongoose.disconnect(); if (replica) await replica.stop() })

test('four concurrent course requests never exceed three enrollments', async () => {
    const responses = await Promise.all(courses.slice(0, 4).map(course => request(app).post(`${prefix}/students/addcourse/${course.id}`).set('Authorization', authorization(student)).send({ studentId: student.id })))
    assert.equal(responses.filter(response => response.status === 200).length, 3)
    assert.equal(responses.filter(response => response.status === 409).length, 1)
    assert.equal(await Course.countDocuments({ students: student._id }), 3)
})

test('concurrent duplicate enrollment has one success and one membership', async () => {
    const responses = await Promise.all(Array.from({ length: 6 }, () => request(app).post(`${prefix}/students/addcourse/${courses[0].id}`).set('Authorization', authorization(student)).send({})))
    assert.equal(responses.filter(response => response.status === 200).length, 1)
    assert.equal(responses.filter(response => response.status === 409).length, 5)
    const persisted = await Course.findById(courses[0]._id)
    assert.equal(persisted.students.filter(id => id.equals(student._id)).length, 1)
})

test('teacher can edit and delete only courses owned by authenticated subject', async () => {
    const denied = await request(app).put(`${prefix}/courses/updateCourse/${courses[0].id}`).set('Authorization', authorization(otherTeacher)).send({ name: 'Foreign edit' })
    assert.equal(denied.status, 404)
    const forgedPath = await request(app).delete(`${prefix}/courses/deleteCourse/${courses[0].id}/${teacher.id}`).set('Authorization', authorization(otherTeacher))
    assert.equal(forgedPath.status, 403)
    const deniedOwnPath = await request(app).delete(`${prefix}/courses/deleteCourse/${courses[0].id}/${otherTeacher.id}`).set('Authorization', authorization(otherTeacher))
    assert.equal(deniedOwnPath.status, 404)
    const own = await request(app).put(`${prefix}/courses/updateCourse/${courses[0].id}`).set('Authorization', authorization(teacher)).send({ name: 'Own edit' })
    assert.equal(own.status, 200)
    assert.equal(own.body.course.name, 'Own edit')
    const injected = await request(app).put(`${prefix}/courses/updateCourse/${courses[0].id}`).set('Authorization', authorization(teacher)).send({ teacher: otherTeacher.id })
    assert.equal(injected.status, 400)
})

test('deleting enrolled course removes membership and frees a slot', async () => {
    for (const course of courses.slice(0, 3)) assert.equal((await request(app).post(`${prefix}/students/addcourse/${course.id}`).set('Authorization', authorization(student)).send({})).status, 200)
    const removed = await request(app).delete(`${prefix}/courses/deleteCourse/${courses[0].id}/${teacher.id}`).set('Authorization', authorization(teacher))
    assert.equal(removed.status, 200)
    assert.equal(await Course.countDocuments({ students: student._id }), 2)
    assert.equal((await request(app).post(`${prefix}/students/addcourse/${courses[3].id}`).set('Authorization', authorization(student)).send({})).status, 200)
    const list = await request(app).get(`${prefix}/students/courses/${student.id}`).set('Authorization', authorization(student))
    assert.equal(list.body.courses.length, 3)
    assert(!list.body.courses.some(course => course._id === courses[0].id))
})

test('students cannot enroll or access another student and cannot elevate role', async () => {
    assert.equal((await request(app).post(`${prefix}/students/addcourse/${courses[0].id}`).set('Authorization', authorization(student)).send({ studentId: otherStudent.id })).status, 403)
    assert.equal((await request(app).get(`${prefix}/students/courses/${otherStudent.id}`).set('Authorization', authorization(student))).status, 403)
    assert.equal((await request(app).put(`${prefix}/students/editStudent/${student.id}`).set('Authorization', authorization(student)).send({ role: 'TEACHER_ROLE' })).status, 400)
    assert.equal((await User.findById(student.id)).role, 'STUDENT_ROLE')
    assert.equal((await request(app).post(`${prefix}/courses/addcourse`).set('Authorization', authorization(student)).send({ name: 'X', description: 'X' })).status, 403)
})

test('profile deletion races enrollment without leaving memberships or active tokens', async () => {
    await Promise.all([request(app).post(`${prefix}/students/addcourse/${courses[0].id}`).set('Authorization', authorization(student)).send({}), request(app).delete(`${prefix}/students/deleteStudent/${student.id}`).set('Authorization', authorization(student))])
    assert.equal((await User.findById(student.id)).status, false)
    assert.equal(await Course.countDocuments({ students: student._id }), 0)
    assert.equal((await request(app).get(`${prefix}/students/courses/${student.id}`).set('Authorization', authorization(student))).status, 401)
})

test('authentication, input validation and response projection reject malformed requests', async () => {
    assert.equal((await request(app).post(`${prefix}/students/addcourse/${courses[0].id}`).send({})).status, 401)
    assert.equal((await request(app).post(`${prefix}/students/addcourse/not-an-id`).set('Authorization', authorization(student)).send({})).status, 400)
    assert.equal((await request(app).get(`${prefix}/courses?limite=-1`)).status, 400)
    const list = await request(app).get(`${prefix}/courses`)
    assert.equal(list.status, 200); assert.equal(list.body.courses[0].students, undefined)
    const edited = await request(app).put(`${prefix}/students/editStudent/${student.id}`).set('Authorization', authorization(student)).send({ name: 'Updated' })
    assert.equal(edited.status, 200); assert.equal(edited.body.user.password, undefined)
})

test('public registration cannot create teachers and login uses password verification', async () => {
    const denied = await request(app).post(`${prefix}/auth/register`).send({ name: 'New Teacher', username: 'new_teacher', email: 'new_teacher@example.test', password: 'TestOnly!2026', phone: '55551111', role: 'TEACHER_ROLE' })
    assert.equal(denied.status, 403)
    const login = await request(app).post(`${prefix}/auth/login`).send({ email: student.email, password: 'TestOnly!2026' })
    assert.equal(login.status, 200); assert(login.body.userDetails.token)
    assert.equal((await request(app).post(`${prefix}/auth/login`).send({ email: student.email, password: 'WrongOnly!2026' })).status, 401)
})

test('demo seed is reproducible and idempotent in a separate synthetic database', () => {
    for (let attempt = 0; attempt < 2; attempt++) {
        const result = spawnSync(process.execPath, ['scripts/seed.js'], { env: { ...process.env, URI_MONGO: replica.getUri('students_seed_demo') }, encoding: 'utf8', timeout: 60000 })
        assert.equal(result.status, 0, result.stderr)
        assert.match(result.stdout, /Seed listo/)
    }
})
