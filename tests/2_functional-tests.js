const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);


const keys = ['issue_title', 'issue_text', 'created_by', 'assigned_to', 'status_text', '_id', 'created_on', 'updated_on', 'open'];

suite('Functional Tests', function() {
    test('Create an issue with every field', ()=>{
        
        chai.request(server)
            .post('/api/issues/test').send({
                issue_title: 'Test 1',
                issue_text: 'This is a test',            
                created_by: 'Daman',
                assigned_to: 'Mukul',
                status_text: 'In progress'               
            })
            .end((err, res)=>{
                assert.equal(res.status, 200);
                
                
                assert.hasAllKeys(res.body, keys);

                // Deleting the user that we created.
                chai.request(server)
                    .delete('/api/issues/test')
                    .send({ _id: res.body['_id']})
                    .end((err, res)=>{
                        assert.equal(res.status, 200);
                        assert.hasAllKeys(res.body, ['result', '_id']);
                    })
            })
 
    });

    

    test('Create an issue with missing required fields', () => {

        chai.request(server)
            .post('/api/issues/test').send({
                issue_title: 'Test 1',
                issue_text: 'This is a test',                
            })
            .end((err, res) => {
                assert.equal(res.status, 200);
                assert.deepEqual(res.body, { error: 'required field(s) missing' });
                
            });
    });

    test('Create an issue with only required field', () => {

        chai.request(server)
            .post('/api/issues/test').send({
                issue_title: 'Test 1',
                issue_text: 'This is a test',
                created_by: 'Daman'
            })
            .end((err, res) => {
                assert.equal(res.status, 200);


                assert.hasAllKeys(res.body, keys);

                // Deleting the user that we created.
                chai.request(server)
                    .delete('/api/issues/test')
                    .send({ _id: res.body['_id'] })
                    .end((err, res) => {
                        assert.equal(res.status, 200);
                        assert.hasAllKeys(res.body, ['result', '_id']);
                    })
            })

    });
    
    suite('View issues on a project', ()=>{
        test('GET request to /api/issues/apitest', ()=>{
            chai.request(server)
            .get('/api/issues/apitest')
            .end((err, res)=>{
                assert.equal(res.status, 200);
                assert.isArray(res.body);
                assert.isAtLeast(res.body.length, 1);
            })
        })
        test('single filter GET request to /api/issues/apitest', () => {
            chai.request(server)
                .get('/api/issues/apitest')
                .query({open: true})
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body.length, 1);
                })
        });
        test('Multiple filter GET request to /api/issues/apitest', () => {
            chai.request(server)
                .get('/api/issues/apitest')
                .query({ open: true, issue_title: 'daman' })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.isArray(res.body);
                    assert.equal(res.body.length, 1);
                })
        })
    })
    suite('Updating issues', ()=>{
        test('Update one field on an issue', ()=>{
            chai.request(server)
            .put('/api/issues/apitest')
            .send({
                _id: '616e8caf3ecbf7b3ce605364',
                created_by: 'zeffy'
            })
            .end((err, res)=>{
                assert.equal(res.status, 200);
                assert.hasAllKeys(res.body, ['result', '_id']);
            })
        });
        test('Update multiple fields on an issue', () => {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '616e8caf3ecbf7b3ce605364',
                    created_by: 'zeffy1',
                    assigned_to: 'zeffy'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.hasAllKeys(res.body, ['result', '_id']);
                })
        });
        test('Update no field on an issue', () => {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    _id: '616e8caf3ecbf7b3ce605364',
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'no update field(s) sent', _id: '616e8caf3ecbf7b3ce605364'});
                })
        });
        test('Update an issue with missing _id', ()=>{
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    issue_title: 'invalid title'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'missing _id' });
                });
            
        })

        test('Update an issue with an invalid _id', () => {
            chai.request(server)
                .put('/api/issues/apitest')
                .send({
                    issue_title: 'invalid title',
                    _id: 'iAmInvalid'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, { error: 'could not update', '_id': 'iAmInvalid' });
                });

        })
        

        // invalid id.
    })

    suite('Deleting user', ()=>{
        test('valid id', () => {

            // Creating a user
            chai.request(server)
                .post('/api/issues/test').send({
                    issue_title: 'Test 1',
                    issue_text: 'This is a test',
                    created_by: 'Daman'
                })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.hasAllKeys(res.body, keys);

                    // Deleting the user that we created.
                    chai.request(server)
                        .delete('/api/issues/test')
                        .send({ _id: res.body['_id'] })
                        .end((err, res) => {
                            assert.equal(res.status, 200);
                            assert.hasAllKeys(res.body, ['result', '_id']);
                        })
                })
        });
        
        test('missing id', ()=>{
            chai.request(server)
                .delete('/api/issues/test')                
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.deepEqual(res.body, {'error': 'missing _id'});
                });
        });
        test('invalid id', ()=>{
            chai.request(server)
                .delete('/api/issues/test')
                .send({ _id: 'thisisinvalid' })
                .end((err, res) => {
                    assert.equal(res.status, 200);
                    assert.hasAllKeys(res.body, ['error', '_id']);
                })
        })
    })
});
