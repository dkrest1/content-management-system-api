const request = require('supertest');
const app = require('../src/app');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { MongoMemoryServer } = require('mongodb-memory-server');
const UserModel = require('../src/models/user.model');

let mongoServer;

beforeAll(async () => {
  // Start the in-memory MongoDB server before all tests
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Stop the in-memory MongoDB server after all tests
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  // Clear the in-memory database before each test
  await mongoose.connection.collection('users').deleteMany({});
});

describe('Server and Tests', () => {
  it('responds with a status of 404', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
  });
});

describe('PATCH /api/v1/users/me', () => {
  let testUser, user, token;

  beforeEach(async () => {
    testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    user = await UserModel.create(testUser);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    token = loginResponse.body.payload.access_token;
  });

  it('should throw a bad request for invalid phone', async () => {
    const updateResponse = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '1234567890',
      });

    expect(updateResponse.statusCode).toBe(400);
    expect(updateResponse.body).toEqual({
      status: 400,
      message: 'Invalid phone number. Must be an 11-digit number without spaces.',
      payload: null,
    });
  });

  it('should update user information successfully', async () => {
    // Update user information
    const updateResponse = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        phone: '12345678901',
      });

    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.headers['content-type']).toMatch(/^application\/json/);
    expect(updateResponse.body).toEqual({
      status: 200,
      message: 'Success',
      payload: { user: expect.objectContaining({ phone: '12345678901' }) },
    });
    const updatedUser = await UserModel.findById(user._id);
    expect(updatedUser.phone).toBe('12345678901');
  });
});

describe('GET /api/v1/users/me', () => {
  it('should retrieve user information successfully', async () => {
    const testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    const user = await UserModel.create(testUser);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    const token = loginResponse.body.payload.access_token;

    // Retrieve user information
    const findUserResponse = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(findUserResponse.statusCode).toBe(200);
    expect(findUserResponse.headers['content-type']).toMatch(/^application\/json/);
    expect(findUserResponse.body).toEqual({
      status: 200,
      message: 'Success',
      payload: {
        user: expect.objectContaining({ email: 'testuser@example.com' }),
      },
    });

    //check if user retrieved from DB is equal to response
    expect(findUserResponse.body.payload.user._id.toString()).toEqual(user._id.toString());
  });
});

describe('DELETE /api/v1/users/me', () => {
  it('should delete the user profile successfully', async () => {
    const testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    const user = await UserModel.create(testUser);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    const token = loginResponse.body.payload.access_token;

    // Delete user profile
    const deleteUserResponse = await request(app)
      .delete('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(deleteUserResponse.statusCode).toBe(200);
    expect(deleteUserResponse.headers['content-type']).toMatch(/^application\/json/);
    expect(deleteUserResponse.body).toEqual({
      status: 200,
      message: 'Profile deleted successfully',
      payload: null,
    });

    // check if user was actually deleted
    const deletedUser = await UserModel.findById(user._id);
    expect(deletedUser).toBeNull();
  });
});

describe('PATCH /api/v1/users/me/password', () => {
  it('should update the user password successfully', async () => {
    const testUser = {
      email: 'testuser@example.com',
      password: 'testPassword123',
      username: 'testuser',
    };

    const user = await UserModel.create(testUser);

    // Login
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'testuser@example.com',
      password: 'testPassword123',
    });

    const token = loginResponse.body.payload.access_token;

    // Update user password
    const updatePasswordResponse = await request(app)
      .patch('/api/v1/users/me/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        old_password: 'testPassword123',
        new_password: 'newTestPassword456',
      });

    expect(updatePasswordResponse.statusCode).toBe(200);
    expect(updatePasswordResponse.headers['content-type']).toMatch(/^application\/json/);
    expect(updatePasswordResponse.body).toEqual({
      status: 200,
      message: 'Password updated successfully',
      payload: null,
    });

    // Check if use password is updated in the DB
    const updatedUser = await UserModel.findById(user._id);
    const isPasswordUpdated = await bcrypt.compare('newTestPassword456', updatedUser.password);
    expect(isPasswordUpdated).toBe(true);
  });
});
