//#region Variables

const usersFromServerPath = 'http://dev.qposoft.com:4082/api/users';

let allUsers = [];

let usersForDeleteWithId = [];
let usersForDeleteLength;

const deleteMultipleButton = document.getElementById('delete-checked-users');

let deleteNumber = 0;
let checkedUser = 0;
let usersForDeleteWithName = [];

let markCheckbox = [];

let paramsQueryString = {
    page: 1,
    search: '',
    pageSize: document.getElementById('num-of-users').value,
    direction: 'asc',
    order: 'email',
}

const params = {
    lastPage: null,
    lastSearch: null,
    changeDirection: 0,
    lastClicked: 'Email',
}

//#endregion

//#region On load users

if (JSON.parse(localStorage.getItem(`params`)) !== null) {
    paramsQueryString = JSON.parse(localStorage.getItem(`params`));
    if (paramsQueryString.search !== '') {
        document.getElementById('delete-search-icon').style.visibility = 'visible';
    }

    document.getElementById('search').value = paramsQueryString.search;
    document.getElementById('num-of-users').value = paramsQueryString.pageSize;
    localStorage.removeItem('params');
}

document.body.addEventListener('load', listData(paramsQueryString));

function listData(paramsQueryString) {
    $.ajax({
        url: usersFromServerPath + '?' + new URLSearchParams(paramsQueryString).toString(),
        type: 'GET',
        success: function (response) {
            listUsers(response.data);
            handlePagination(response.meta, response.links);
            handleCheckBoxForDelete();
        }
    });
}

//#endregion

//#region Pagination

function handlePagination(meta, links) {
    params.lastPage = meta.last_page;

    if (links.prev !== null) {
        changeSide('first-page-button', 'pagination-left', false);
    } else {
        changeSide('first-page-button', 'pagination-left', true);
    }

    if (links.next !== null) {
        changeSide('last-page-button', 'pagination-right', false);
    } else {
        changeSide('last-page-button', 'pagination-right', true);
    }
}

function changeSide(firstLastPage, moveLeftRight, boolean) {
    document.getElementById(firstLastPage).disabled = boolean;
    document.getElementById(moveLeftRight).disabled = boolean;
}

function moveLeft() {
    paramsQueryString.page -= 1;
    listData(paramsQueryString);
}

function moveRight() {
    paramsQueryString.page += 1;
    listData(paramsQueryString);
}

function moveToFirstPage() {
    paramsQueryString.page = 1;
    listData(paramsQueryString);
}

function moveToLastPage() {
    paramsQueryString.page = params.lastPage;
    listData(paramsQueryString);
}

//#endregion

//#region List users

function listUsers(users) {
    allUsers = users;

    const tableBody = document.getElementById('tbody-add-users');

    if (users.length === 0) {
        tableBody.innerHTML = 'No users found!';
    } else {
        tableBody.innerHTML = '';

        for (const user of users) {
            let trUsers = document.getElementById('tr-users');
            let cloneUserRow = trUsers.cloneNode(true);
            cloneUserRow.id = `user-row-${user.id}`;

            cloneUserRow.querySelector('.checkbox-user').id = `check-box-${user.id}`;
            cloneUserRow.querySelector('.checkbox-user').onclick = function () { markForDelete(user.id) };
            cloneUserRow.querySelector('td.user-id-wrapper').innerHTML = user.id;
            cloneUserRow.querySelector('td.user-name-wrapper').innerHTML = user.name;
            cloneUserRow.querySelector('td.user-email-wrapper').innerHTML = user.email;
            cloneUserRow.querySelector('td.user-created-wrapper').innerHTML = user.created;
            cloneUserRow.querySelector('.user-delete-button').id = `delete-user-button${user.id}`;
            cloneUserRow.querySelector('.user-delete-button').onclick = function () { deleteOneUser(user.id) };

            cloneUserRow.querySelector('.user-update-button').onclick = function () {
                localStorage.setItem(`update-user-button`, user.id);
                localStorage.setItem(`checkbox-update`, JSON.stringify(markCheckbox));
                localStorage.setItem(`users-update`, JSON.stringify(usersForDeleteWithId));
                localStorage.setItem(`user-names-update`, JSON.stringify(usersForDeleteWithName));
                localStorage.setItem(`params`, JSON.stringify(paramsQueryString));

                location.href = `./update-user.html`;
            };

            tableBody.appendChild(cloneUserRow);
        }
    }
}

//#endregion

//#region Search bar

function filterData() {
    let filter = document.getElementById('search').value;

    if (document.getElementById('search').value !== '') {
        document.getElementById('delete-search-icon').style.visibility = 'visible';
    } else {
        document.getElementById('delete-search-icon').style.visibility = 'hidden';
    }

    if (params.lastSearch !== filter) {
        paramsQueryString.search = filter;
        params.lastSearch = filter;
        paramsQueryString.page = 1;
        listData(paramsQueryString);
    }
}

function clearSearchBar() {
    document.getElementById('search').value = '';
    paramsQueryString.search = '';
    listData(paramsQueryString);

    document.getElementById('search').focus();
    document.getElementById('delete-search-icon').style.visibility = 'hidden';
}

//#endregion

//#region Delete one user, recursive and async method

function deleteOneUser(userId) {
    const deleteButton = document.getElementById('delete-user-button' + userId);
    deleteButton.disabled = true;

    let userName;

    for (const user of allUsers) {
        if (user.id === userId) {
            userName = user.name;
            break;
        }
    }

    const result = confirm("Want to delete user " + userName + "?");

    if (result) {
        let num = 0;
        for (const user of usersForDeleteWithId) {
            if (user === userId) {
                usersForDeleteWithId.splice(num, 1);
                usersForDeleteWithName.splice(num, 1);
                break;
            }
            num++;
        }

        $.ajax({

            url: usersFromServerPath + '/' + userId,
            type: 'DELETE',
            contentType: "application/json;charset=utf-8",
            success: function (response) {
                if (allUsers.length === 1) {
                    paramsQueryString.page -= 1;
                }
                listData(paramsQueryString);
            }
        });
    } else {
        deleteButton.disabled = false;
    }
}

//#region async

// function deleteUsers(userId) {
//     let valueFromSuccess = null;
//     return new Promise(function (resolve, reject) {
//         $.ajax({
//             url: 'http://dev.qposoft.com:60000/qpo-jr/api/users/' + userId,
//             type: 'DELETE',
//             contentType: "application/json;charset=utf-8",
//             success: function (response) {
//                 resolve(true);
//             }
//         });
//     });
// }

// function deleteMultiple() {
//     deleteMultipleButton.disabled = true;
//     let checkboxes = document.getElementsByName('userCheckbox');
//     let usersForDelete = [];
//     usersForDeleteWithId = [];

//     for (const checkbox of checkboxes) {
//         if (checkbox.checked) {
//             for (const user of allUsers) {
//                 if (user.id === parseInt(checkbox.value)) {
//                     usersForDelete.push(user.name);
//                     break;
//                 }
//             }
//         }
//     }

//     let result = confirm("Want to delete users " + usersForDelete + "?");

//     if (result) {
//         for (const checkbox of checkboxes) {
//             if (checkbox.checked) {
//                 usersForDeleteWithId.push(parseInt(checkbox.value));
//             }
//         }

//         usersForDeleteLength = usersForDeleteWithId.length;
//         deleteAllCheckedUsers(usersForDeleteWithId, usersForDeleteLength);
//     }
//     else {
//         deleteMultipleButton.disabled = false;
//     }
// }

// async function deleteAllCheckedUsers(usersForDeleteWithId) {
//     for (const user of usersForDeleteWithId) {
//         await deleteUsers(user);
//     }

//     if (allUsers.length - usersForDeleteLength === 0) {
//         if (paramsQueryString.page !== 1) {
//             paramsQueryString.page -= 1;
//             listData(paramsQueryString);
//         } else {
//             paramsQueryString.page = 1;
//             listData(paramsQueryString);
//         }
//     } else {
//         listData(paramsQueryString);
//     }

//     deleteMultipleButton.disabled = false;
// }

//#endregion

//#region recursive

function deleteUsers(usersForDeleteWithId, n) {
    $.ajax({
        url: usersFromServerPath + '/' + usersForDeleteWithId[n - 1],
        type: 'DELETE',
        contentType: "application/json;charset=utf-8",
        success: function (response) {
            if (n === 1) {
                if (allUsers.length - usersForDeleteLength <= 0) {
                    if (paramsQueryString.page !== 1) {
                        paramsQueryString.page -= 1;
                    } else {
                        paramsQueryString.page = 1;
                    }
                }

                listData(paramsQueryString);
            } else {
                deleteUsers(usersForDeleteWithId, n - 1);
            }
        }
    });
}

// function deleteMultiple() {
//     deleteMultipleButton.disabled = true;
//     let checkboxes = document.getElementsByName('userCheckbox');
//     let usersForDelete = [];
//     usersForDeleteWithId = [];

//     for (const checkbox of checkboxes) {
//         if (checkbox.checked) {
//             for (const user of allUsers) {
//                 if (user.id === parseInt(checkbox.value)) {
//                     usersForDelete.push(user.name);
//                     break;
//                 }
//             }
//         }
//     }

//     let result = confirm("Want to delete users " + usersForDelete + "?");

//     if (result) {
//         for (const checkbox of checkboxes) {
//             if (checkbox.checked) {
//                 usersForDeleteWithId.push(parseInt(checkbox.value));
//             }
//         }

//         usersForDeleteLength = usersForDeleteWithId.length;
//         deleteUsers(usersForDeleteWithId, usersForDeleteLength);
//     }
//     else {
//         deleteMultipleButton.disabled = false;
//     }
// }

//#endregion

//#endregion

//#region Add new user

function submitNewUser() {
    if (document.getElementById('input-form-wrapper').style.visibility === 'hidden') {
        document.getElementById('input-form-wrapper').style.visibility = 'visible';
    } else {

        let nameFromInput = document.getElementById('name').value;
        let emailFromInput = document.getElementById('email').value;

        document.getElementById("name").value = '';
        document.getElementById("email").value = '';

        document.getElementById('error-message').innerHTML = '';
        document.getElementById('success-message').innerHTML = '';

        let user = {
            name: nameFromInput,
            email: emailFromInput
        }

        let userObject = JSON.stringify(user);

        let validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

        if (emailFromInput.match(validEmail) && nameFromInput !== '') {
            document.getElementById('add-button').disabled = true;

            $.ajax({
                url: usersFromServerPath,
                type: 'POST',
                contentType: "application/json;charset=utf-8",
                data: userObject,
                success: function () {
                    enableAndSuccessfully();
                    listData(paramsQueryString);
                },
                error: function (response) {
                    enableAndFailedResponse(response);
                }
            });
        } else {
            document.getElementById('error-message').innerHTML = 'Invalid name or email';
        }
    }
}

function enableAndSuccessfully() {
    document.getElementById('add-button').disabled = false;
    document.getElementById('success-message').innerHTML = 'Successfully completed';
}

function enableAndFailedResponse(response) {
    document.getElementById('add-button').disabled = false;
    document.getElementById('error-message').innerHTML = response.responseJSON.errors.email[0];
}

//#endregion

//#region Select number of users and sort

function exactlyNumOfUsers() {
    let numberOfUsers = document.getElementById('num-of-users').value;
    paramsQueryString.pageSize = numberOfUsers;
    listData(paramsQueryString);
}

function sortTable(sortBy) {
    const orderSpan = document.querySelector(`#header-${params.lastClicked.toLocaleLowerCase()} > span.order`);
    orderSpan.innerHTML = '';

    const orderSort = document.querySelector(`#header-${sortBy} > span.order`);

    params.lastClicked = sortBy;
    paramsQueryString.order = sortBy;

    if (params.changeDirection === 0) {
        orderSort.innerHTML = '&#8593;';
        paramsQueryString.direction = 'desc';
        params.changeDirection = 1;
    } else {
        orderSort.innerHTML = '&#8595;';
        paramsQueryString.direction = 'asc';
        params.changeDirection = 0;
    }
    listData(paramsQueryString);
}

//#endregion

//#region Prepare and delete checked

function markForDelete(id) {
    checkedUser = 0;
    deleteNumber = 0;
    objectForCheckBox = {
        key: `check-box-${id}`,
        value: `true`
    }
    for (const user of usersForDeleteWithId) {
        if (user === id) {
            checkedUser = 1;
            usersForDeleteWithId.splice(deleteNumber, 1);
            usersForDeleteWithName.splice(deleteNumber, 1);
            markCheckbox.splice(deleteNumber, 1);
            break;
        }
        deleteNumber++;
    }
    if (checkedUser === 0) {
        usersForDeleteWithId.push(id);
        for (const name of allUsers) {
            if (name.id === id) {
                usersForDeleteWithName.push(name.name);
            }
        }
        markCheckbox.push(objectForCheckBox);
    }

    if (usersForDeleteWithId.length !== 0) {
        deleteMultipleButton.disabled = false;
    } else {
        deleteMultipleButton.disabled = true;
    }
}

function deleteMultiple() {
    deleteMultipleButton.disabled = true;
    let result = confirm("Want to delete users " + usersForDeleteWithName + "?");

    if (result) {
        usersForDeleteLength = usersForDeleteWithId.length;
        deleteUsers(usersForDeleteWithId, usersForDeleteLength);
        usersForDeleteWithId = [];
        usersForDeleteWithName = [];
    }
    else {
        deleteMultipleButton.disabled = false;
    }
}

function handleCheckBoxForDelete() {
    if (JSON.parse(localStorage.getItem(`checkbox-update`) || `[]`).length !== 0) {
        markCheckbox = JSON.parse(localStorage.getItem(`checkbox-update`) || `[]`);
        usersForDeleteWithId = JSON.parse(localStorage.getItem(`users-update`) || `[]`);
        usersForDeleteWithName = JSON.parse(localStorage.getItem(`user-names-update`) || `[]`);

        localStorage.removeItem(`checkbox-update`);
        localStorage.removeItem(`users-update`);
        localStorage.removeItem(`user-names-update`);
    }

    if (usersForDeleteWithId.length === 0) {
        deleteMultipleButton.disabled = true;
    } else {
        for (const checkedUser of usersForDeleteWithId) {
            for (const user of allUsers) {
                if (user.id === checkedUser) {
                    for (const mark of markCheckbox) {
                        if (mark.key === `check-box-${checkedUser}`) {
                            document.getElementById(`${mark.key}`).checked = mark.value;
                        }
                    }
                }
            }
        }
    }
}

//#endregion