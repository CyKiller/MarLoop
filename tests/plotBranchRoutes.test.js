const request = require('supertest');
const app = require('../server');
const mongoose = require('mongoose');
const User = require('../models/User');
const BookProject = require('../models/BookProject');
const PlotBranch = require('../models/plotBranchSchema');

describe('Plot Branch Routes', () => {
  let user;
  let bookProject;
  let plotBranch;

  beforeAll(async () => {
    // Connect to a new in-memory database before running any tests.
    await mongoose.connect(process.env.TEST_MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true }).catch(error => console.error('Error connecting to in-memory database:', error));

    // Create a user
    user = await User.create({ username: 'testuser', password: 'password' }).catch(error => console.error('Error creating user in test setup:', error));

    // Create a book project
    bookProject = await BookProject.create({ userId: user._id, genre: 'Fantasy', aiQuestion: 'What is the plot?' }).catch(error => console.error('Error creating book project in test setup:', error));

    // Create a plot branch
    plotBranch = await PlotBranch.create({ userId: user._id, bookProjectId: bookProject._id, branchTitle: 'Initial Branch', plotContent: 'Initial Content' }).catch(error => console.error('Error creating plot branch in test setup:', error));
  });

  afterAll(async () => {
    await PlotBranch.deleteMany({}).catch(error => console.error('Error cleaning up plot branches:', error));
    await BookProject.deleteMany({}).catch(error => console.error('Error cleaning up book projects:', error));
    await User.deleteMany({}).catch(error => console.error('Error cleaning up users:', error));
    await mongoose.connection.close().catch(error => console.error('Error closing database connection:', error));
  });

  test('Create a new plot branch', async () => {
    const response = await request(app)
      .post('/create-branch')
      .send({ userId: user._id.toString(), bookProjectId: bookProject._id.toString(), branchTitle: 'New Branch', plotContent: 'Content' });
    expect(response.statusCode).toBe(201);
    console.log('Test for creating a new plot branch passed.');
  });

  test('Update an existing plot branch', async () => {
    const response = await request(app)
      .put(`/update-branch/${plotBranch._id}`)
      .send({ branchTitle: 'Updated Branch Title', plotContent: 'Updated Content' });
    expect(response.statusCode).toBe(200);
    console.log('Test for updating an existing plot branch passed.');
  });

  test('Delete a plot branch', async () => {
    const response = await request(app)
      .delete(`/delete-branch/${plotBranch._id}`);
    expect(response.statusCode).toBe(204);
    console.log('Test for deleting a plot branch passed.');
  });

  test('Retrieve branches for a book project', async () => {
    const response = await request(app)
      .get(`/get-branches/${bookProject._id}`);
    expect(response.statusCode).toBe(200);
    expect(Array.isArray(response.body)).toBeTruthy();
    console.log('Test for retrieving branches for a book project passed.');
  });
});