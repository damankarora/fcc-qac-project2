const mongoose = require('mongoose');

const connect = async (uri)=>{
    if (uri) {
        mongoose.connect(uri).then(()=>{
            return Promise.resolve();
        }).catch((err)=>{
            return Promise.reject(err);
        })
    }else{
        return Promise.reject('No uri given');
    }
}

const issueSchema = new mongoose.Schema({
    issue_title: String,
    issue_text: String,
    created_on: String,
    updated_on: String,
    created_by: String,
    assigned_to: String,
    open: Boolean,
    status_text: String,
    project: String
});

const Issue = mongoose.model('Issue', issueSchema);

const newIssue = async (issueData)=>{
    const ourIssue = new Issue(issueData);
    await ourIssue.save();
    return await findIssues({_id: ourIssue._id});
    
}

const findIssues = async (queryObject) => {
    const issues = await Issue.find(queryObject, '-project -__v');
    return issues;
}

const updateIssue = async (id, updationObject) => {
    const ourIssue = await Issue.findById(id);
    for(let prop in updationObject){
        ourIssue[prop] = updationObject[prop];
    }
    await ourIssue.save();    
}

const deleteIssue = async (id) => {
    let issue = await Issue.findById(id);
    if(!issue){
        throw new Error('invalid _id');
    }
    await Issue.findByIdAndDelete(id).exec();
}


module.exports = {
    connect,
    newIssue,
    findIssues,
    updateIssue,
    deleteIssue
}