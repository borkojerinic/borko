//#region Update user

const relativePathToListUsers = './list-users.html';
const usersFromServerPath = 'http://dev.qposoft.com:4082/api/users';
const myId = JSON.parse(localStorage.getItem('update-user-button'));

let nameBeforeUpdate = '';
let emailBeforeUpdate = '';

document.body.addEventListener('load', userData(myId));

function userData(id) {
    $.ajax({
        url: usersFromServerPath + '/' + id,
        type: 'GET',
        success: function (response) {
            setInputForUser(response.data);
        }
    });
}

function setInputForUser(userData) {
    nameBeforeUpdate = document.getElementById('name').value = userData.name;
    document.title = nameBeforeUpdate;
    emailBeforeUpdate = document.getElementById('email').value = userData.email;
}

function updateUser() {
    document.getElementById('error-message').innerHTML = '';
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (email.match(validEmail)) {
        if (nameBeforeUpdate !== name || emailBeforeUpdate !== email) {
            $.ajax({
                url: `${usersFromServerPath}/${myId}?name=${name}&email=${email}`,
                type: 'PUT',
                success: function (response) {
                    location.href = relativePathToListUsers;
                },
                error: function (request, status, error) {
                    document.getElementById('message').style.visibility = 'visible';
                    document.getElementById('error-message').innerHTML = JSON.parse(request.responseText).errors.name;
                }
            });
        } else {
            document.getElementById('message').style.visibility = 'visible';
            document.getElementById('error-message').innerHTML = 'Unchanged form!';
        }
    } else {
        document.getElementById('message').style.visibility = 'visible';
        document.getElementById('error-message').innerHTML = 'Invalid email!';
    }
}

document.getElementById('go-back').onclick = function () {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;

    if (nameBeforeUpdate !== name || emailBeforeUpdate !== email) {
        const result = confirm("Do u want to save changes?");
        if (result) {
            $.ajax({
                url: `${usersFromServerPath}/${myId}?name=${name}&email=${email}`,
                type: 'PUT',
                success: function (response) {
                    location.href = relativePathToListUsers;
                },
                error: function (request, status, error) {
                    document.getElementById('message').style.visibility = 'visible';
                    document.getElementById('error-message').innerHTML = JSON.parse(request.responseText).errors.name;
                }
            });
        }
    } else {
        location.href = relativePathToListUsers;
    }
}

//#endregion