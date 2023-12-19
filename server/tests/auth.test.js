const request = require("supertest");
const app = require("../src/index")

describe("Server Running", () => {

    it('respond with a status of 404', async() => {
        const response = await request(app).get("/")
        expect(response.statusCode).toBe(404)
    })

});


describe('Authentication Route', () => {

    afterEach(() => {
        app.close();
    });

    it('responds with status 201', async () => {
      const response = await request(app).post('/api/v1/auth/signup');
      expect(response.statusCode).toBe(201);
    });
  
    // it('responds with JSON', async () => {
    //   const response = await request(app).get('/api/myRoute');
    //   expect(response.headers['content-type']).toMatch(/json/);
    // });
  
    // Add more tests as needed
  });