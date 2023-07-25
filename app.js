const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json())

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();
const hasPriorityAndStatusProperties=(requestQuery)=>{
  return(

  
    requestQuery.priority !==undefined && requestQuery.status!==undefined 
    );
  
}
const hasPriorityProperties=(requestQuery)=>{
  return (
    requestQuery.priority!==undefined
  )
}

const hasStatusProperties=(requestQuery)=>{
  return (
    requestQuery.status!==undefined
  )
}


app.get("/todos/",async(request,response)=>{
    let data=null;
    let getTodoQuery="";
    const {search_q="",priority,status}=request.query
    switch(true){
      case hasPriorityAndStatusProperties(request.query):
      getTodoQuery=`
      SELECT * FROM todo
      WHERE todo LIKE "%${search_q}%"
      AND priority '${priority}'
       AND status '${status}';
      `;
      break;
      case hasPriorityProperties(request.query):
      getTodoQuery=`
      SELECT * FROM todo
      WHERE todo LIKE "%${search_q}%"
      AND priority '${priority}'
       
      `;
      break;
      case hasStatusProperties(request.query):
      getTodoQuery=`
      SELECT * FROM todo
      WHERE todo LIKE "%${search_q}%"
      AND status '${status}'
       
      `;
      break;
      default:
      getTodoQuery=`
      SELECT * FROM todo
      WHERE todo LIKE "%${search_q}%";
      `;
      data=await db.all(getTodoQuery)
      response.send(data)
      
    }

})


app.get("/todos/:todoId/",async(request,response)=>{
  const {todoId}=request.params;

  const getTodo=`
  SELECT * FROM todo
  WHERE id=${todoId};
  `;
  const todo=await db.get(getTodo)
  response.send(todo)
})


app.post("/todos/",async(request,response)=>{
  const {id,todo,priority,status}=request.body
  const postQuery=`
  INSERT INTO todo (id,todo,priority,status)
  VALUES(
    ${id},
    "${todo}",
    "${priority}",
    "${status}"
  );
  `;
  await db.run(postQuery)
  response.send("Todo Successfully Added")
})

app.put("/todos/:todoId/",(request,response)=>{
  const {todoId}=request.params;
  
  let updateColumn=""
  const requestBody=request.body

  switch(true){
    case requestBody.status!==undefined:
    updateColumn="Status";
    break;
    case requestBody.priority!==undefined:
    updateColumn="Priority";
    break;
    case requestBody.todo!==undefined:
    updateColumn="Todo";
    break;

    const previousTodoQuery=`
    
    SELECT * FROM todo
    WHERE id=${todoId};`;

    
    const previousTodo=await db.get(previousTodoQuery)
    const {
      todo=previousTodo.todo,
      priority=previousTodo.priority,
      status=previousTodo.status

    }=request.body
    const updateQuery=`
    UPDATE todo 
    SET 
    todo='${todo}',
    priority='${priority}',
    status='${status}'
    WHERE id='${todoId}';
    `;
  await db.run(updateQuery)
  response.send(`${updateColumn} Updated`)

  }


})


app.delete("/todos/:todoId/",async(request,response)=>{
  const {todoId}=request.params;
  const delQuery=`
  DELETE * FROM 
  todo 
  WHERE id=${todoId};
  `;
  db.run(delQuery)
  response.send("Todo Deleted")
})

module.exports=app