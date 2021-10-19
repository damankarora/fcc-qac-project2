'use strict';
const DbStuff = require('../database/dbstuff');

DbStuff.connect(process.env.MONGO).then(()=>{
  console.log("Database connection successful")
}).catch((err)=>{
  console.log(err);
})

const getUpdationObject = (body)=>{
  let result = {};

  if(body['open']){
    result['open'] = false;
  }else{
    result['open'] = true;
  }

  for(let prop in body){
    if(prop === 'open'){      
      continue;
    }
    if(body[prop] !== '' && prop !== '_id'){
      result[prop] = body[prop];
    }
  }

  result['updated_on'] = new Date().toISOString();
  return result;
}

const checkMissingFields = ({issue_text, issue_title, created_by})=>{
  if (!issue_title || !issue_text || !created_by || issue_title === '' || issue_text === '' || created_by === '') {
    return true;
  }
  return false;
}

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filters = {};
      if(Object.keys(req.query).length !== 0){
        
        filters = {...req.query};
      }
      filters.project = project;
      
      DbStuff.findIssues(filters).then((data)=>{
        res.json(data)
      }).catch((err)=>{
        res.send("Someting went wrong");
      })
      
      
      
    })
    
    .post(function (req, res){
      // Parsing information
      let project = req.params.project;
      let {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;

      // Checking if any required field is missing.
      if(checkMissingFields(req.body)){
        return res.json({ error: 'required field(s) missing' });
      }
      

      // Setting empty strings if optional fields are empty
      if(!assigned_to){
        assigned_to = "";
      }
      if(!status_text){
        status_text = "";
      }

      // Gathering more information.
      const created_on = new Date().toISOString();
      const updated_on = created_on;
      const open = true;

      // Inserting new issue in database.
      DbStuff.newIssue({issue_title, issue_text, created_on, updated_on, created_by, assigned_to, open, status_text, project}).then((data)=>{
        return res.json(data);
      }).catch(()=>{
        return res.send("OOPS! something went wrong");
      })

    })
    
    .put(function (req, res){
      let ourId = req.body['_id']
      if(!ourId){
        return res.json({ error: 'missing _id' });
      }

      if(Object.keys(req.body).length <= 1){
        return res.json({ error: 'no update field(s) sent', '_id': ourId })
      }
      let updationObject = getUpdationObject(req.body);      
      DbStuff.updateIssue(ourId, updationObject)
      .then(()=>{
        return res.json({ result: 'successfully updated', '_id': ourId });
      })
      .catch((err)=>{
        res.status(402).send("Invalid request");
      })
      
    })
    
    .delete(function (req, res){
      let ourId = req.body['_id']
      if(!ourId || ourId === ''){
        return res.json({error: 'missing _id'});
      }

      DbStuff.deleteIssue(ourId)
      .then(() => res.json({
        result: 'successfully deleted',
        '_id': ourId
      }))
      .catch(()=>{
        res.json({ error: 'could not delete', '_id': ourId })
      })

    });
    
};
