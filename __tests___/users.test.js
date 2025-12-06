const { describe } = require('node:test');
const request = require('supertest');
const app = require('../src/app');

describe("Users API endpoints", ()=>{
it("Create a new user using users/", async ()=>{
    const testUser ={   
        "username":"test2",
        "email":"test2@gmail.com",
        "password":"123456"
    };
    const response = await request(app).post('/users/').send(testUser).expect(201)

    console.log(response)

    
});

it("User logins in and gets the token using /users/login", async ()=>{
    const user = {
         "username":"test2",
          "password":"123456"

    };

    const response = await request(app).post('/users/login').send(user).expect(200);

    console.log(response.body);

    expect(response.body).toHaveProperty('token')
})


})
