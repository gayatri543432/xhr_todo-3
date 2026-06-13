const cl=console.log;
const todoForm=document.getElementById('todoForm')
const titleControl=document.getElementById('title')
const completedControl=document.getElementById('completed')
const userIdControl=document.getElementById('userId')
const addBtn=document.getElementById('addBtn')
const updateBtn=document.getElementById('updateBtn')
const todoContainer=document.getElementById('todoContainer')
const spinner=document.getElementById('spinner')


let todoArr=[]

let BASE_URL=`https://jsonplaceholder.typicode.com`
let POST_URL=`${BASE_URL}/todos`

function snackBar(msg,i){
    Swal.fire({
        title:msg,
        icon:i,
        timer:300
    })
}


function updateSrNo() {
    let allRows = todoContainer.querySelectorAll('tr');

    allRows.forEach((row, index) => {
        row.children[0].innerText = index + 1;
    });
}

function fetchTodos(){
    let xhr=new XMLHttpRequest()
    xhr.open('GET',POST_URL)
    xhr.send(null)
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            todoArr=res
            createTodos(res.reverse())
            
        }else{
            snackBar('Error..','error')
        }
    }
    xhr.onerror=function(){
            snackBar('Error..','error')
    }
}
fetchTodos()

function createTodos(arr){
    let res=''
    arr.forEach((t,i)=>{
        res+=`<tr id="${t.id}">
                                    <td>${i+1}</td>
                                    <td>${t.userId}</td>
                                    <td>${t.title}</td>
                                    <td>${t.completed?'<i class="fa-solid fa-square-check text-primary"></i>Complete':'<i class="fa-solid fa-spinner text-warning"></i>Pending'}</td>
                                    <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                                    <td><i onclick="onRemove(this)" class="fa-solid fa-trash-can fa-2x text-danger"></i></td>
                                </tr>`
                            
    })
    todoContainer.innerHTML=res
    
}

function onTodoSubmit(e){
    e.preventDefault()
    spinner.classList.remove('d-none');
    let new_Todo={
        userId:userIdControl.value,
        title:titleControl.value,
        completed:completedControl.value
    }
    let xhr=new XMLHttpRequest()
    xhr.open('POST',POST_URL)
    xhr.setRequestHeader(
    'Content-Type',
    'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(new_Todo))
    xhr.onload=function(){
        if(xhr.status>=200 && xhr.status<=299){
            let res=JSON.parse(xhr.response)
            let tr=document.createElement('tr')
            tr.id=res.id
            tr.innerHTML=` <td></td>
                                    <td>${new_Todo.userId}</td>
                                    <td>${new_Todo.title}</td>
                                    <td>${new_Todo.completed?'<i class="fa-solid fa-square-check"></i>Complete text-primary':'<i class="fa-solid fa-spinner text-warning"></i>Pending'}</td>
                                    <td><i onclick="onEdit(this)" class="fa-solid fa-pen-to-square fa-2x text-primary"></i></td>
                                    <td><i onclick="onRemove(this)" class="fa-solid fa-trash-can fa-2x text-danger"></i></td>`
                            // updateSrNo()
                            todoContainer.prepend(tr)
                            todoArr.unshift(res);
                            updateSrNo()
                            todoForm.reset()
                            spinner.classList.add('d-none')
                            snackBar('New Todo Created..','success')

        }else{
            spinner.classList.add('d-none')
            snackBar('Error','error')
        }
    }
    xhr.onerror = function(){
    spinner.classList.add('d-none');
    snackBar('Network Error','error');
}
}

function onEdit(ele){

    let EDIT_ID = ele.closest('tr').id;

    localStorage.setItem('EDIT_ID', EDIT_ID);

    let row = document.getElementById(EDIT_ID);

    userIdControl.value = row.children[1].innerText;
    titleControl.value = row.children[2].innerText;

    completedControl.value =
        row.children[3].innerText.includes('Complete')
        ? 'true'
        : 'false';

    addBtn.classList.add('d-none');
    updateBtn.classList.remove('d-none');
}

function onUpdateTodo(){
    spinner.classList.remove('d-none')
    let EDIT_ID = localStorage.getItem('EDIT_ID');

    let UPDATE_URL = `${POST_URL}/${EDIT_ID}`;

    let updatedTodo = {
        userId: userIdControl.value,
        title: titleControl.value,
        completed: completedControl.value === 'true'
    };

  

    let xhr = new XMLHttpRequest();

    xhr.open('PATCH', UPDATE_URL);

    xhr.setRequestHeader(
        'Content-Type',
        'application/json; charset=UTF-8'
    );

    xhr.send(JSON.stringify(updatedTodo));

    xhr.onload = function(){

       

        if(xhr.status >= 200 && xhr.status <= 299){

            let row = document.getElementById(EDIT_ID);

            row.children[1].innerText = updatedTodo.userId;
            row.children[2].innerText = updatedTodo.title;

            row.children[3].innerHTML =
                updatedTodo.completed
                ? '<i class="fa-solid fa-square-check text-success"></i> Complete'
                : '<i class="fa-solid fa-spinner text-warning"></i> Pending';

            todoForm.reset();

            addBtn.classList.remove('d-none');
            updateBtn.classList.add('d-none');
              spinner.classList.add('d-none')

            localStorage.removeItem('EDIT_ID');

            snackBar('Todo Updated Successfully', 'success');

        }else{
              spinner.classList.add('d-none')
            snackBar('Update Failed', 'error');
        }
    };

    xhr.onerror = function(){

        spinner.classList.add('d-none');

        snackBar('Network Error', 'error');
    };
}

function onRemove(ele){

    let REMOVE_ID = ele.closest('tr').id;

    Swal.fire({
        title: "Are you sure?",
        text: "This todo will be deleted permanently!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745",
        cancelButtonColor: "#dc3545",
        confirmButtonText: "Yes, Delete It!"
    }).then((result) => {

        if(result.isConfirmed){

            spinner.classList.remove('d-none');

            let DELETE_URL = `${POST_URL}/${REMOVE_ID}`;

            let xhr = new XMLHttpRequest();

            xhr.open('DELETE', DELETE_URL);

            xhr.send(null);

            xhr.onload = function(){

                

                if(xhr.status >= 200 && xhr.status <= 299){

                    document.getElementById(REMOVE_ID).remove();

                    updateSrNo();
                    spinner.classList.add('d-none');
                    snackBar('Todo Deleted Successfully','success');

                }else{
                    spinner.classList.add('d-none');
                    snackBar('Delete Failed','error');
                }
            };
        }
    });
}

todoForm.addEventListener('submit',onTodoSubmit)
updateBtn.addEventListener('click', onUpdateTodo);