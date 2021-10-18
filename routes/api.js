'use strict';
const DbStuff = require('../database/dbstuff');

DbStuff.connect(process.env.MONGO).then(()=>{
  console.log("Database connection successful")
}).catch((err)=>{
  console.log(err);
})


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let filters = null;
      if(Object.keys(req.query).length !== 0){
        // TODO: set filters.
      }
      if(!filters){
        DbStuff.findIssues({project}).then((data)=>{
          res.json(data)
        }).catch((err)=>{
          res.send("Someting went wrong");
        })
      }
      
      
    })
    
    .post(function (req, res){
      // Parsing information
      let project = req.params.project;
      let {issue_title, issue_text, created_by, assigned_to, status_text} = req.body;

      // Checking if any required field is missing.
      if(!issue_title || !issue_text || !created_by){
        return res.status(402).send("Bad Request");
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
      }).catch((err)=>{
        return res.send("OOPS! something went wrong");
      })

    })
    
    .put(function (req, res){
      let project = req.params.project;
      
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      
    });
    
};
