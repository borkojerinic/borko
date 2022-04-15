//#region Update user

let path = '../borko/list-users.html';
let url = 'http://dev.qposoft.com:4082/api/users';
let myId = JSON.parse(localStorage.getItem('update-user-button'));
let nameBeforeUpdate = '';
let emailBeforeUpdate = '';

document.body.addEventListener('load', userData(myId));

function userData(id) {
    $.ajax({
        url: url + '/' + id,
        type: 'GET',
        success: function (response) {
            setInputForUser(response.data);
        }
    });
}

function setInputForUser(userData) {
    nameBeforeUpdate = document.getElementById('update-name').value = userData.name;
    emailBeforeUpdate = document.getElementById('update-email').value = userData.email;
}

function updateUser() {
    document.getElementById('message-update').innerHTML = '';
    let name = document.getElementById('update-name').value;
    let email = document.getElementById('update-email').value;
    let validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (email.match(validEmail)) {
        $.ajax({
            url: `${url}/${myId}?name=${name}&email=${email}`,
            type: 'PUT',
            success: function (response) {
                location.href = path;
            },
            error: function (request, status, error) {
                document.getElementById('error-success-update').style.visibility = 'visible';
                document.getElementById('message-update').innerHTML = JSON.parse(request.responseText).errors.name;
            }
        });
    } else {
        document.getElementById('error-success-update').style.visibility = 'visible';
        document.getElementById('message-update').innerHTML = 'Invalid email!';
    }
}

document.getElementById('go-back').onclick = function () {
    location.href = path;
}

//#endregion