## Production
https://trelolo.onrender.com

## Usage

- **[Authentication](#authentication)**
- **User**
    - [Register (sign up)](#register)
    - [Log in](#log-in)
    - [Get](#get-user)
    - [Patch](#update-user)
- **Projects**
  - [Get list](#get-projects)
  - [Create](#create-project)
  - [Update](#update-project)
  - [Delete](#delete-project)
- **Sections**
  - [Get list](#get-sections)
  - [Create](#create-section)
  - [Update](#update-section)
  - [Delete](#delete-section)
  - [Move](#move-section)
- **Tasks**
  - [Get list](#get-tasks)
  - [Get list by section](#get-section-tasks)
  - [Create](#create-task)
  - [Update](#update-task)
  - [Delete](#delete-task)
  - [Move](#move-task)
  
  - **Assignee** 
    - [Create](#add-task-assignee)
    - [Delete](#remove-task-assignee)
  - **Comment**
    - [Get list](#get-task-comments)
    - [Create](#create-task-comment)
    - [Update](#update-task-comment)
    - [Delete](#remove-task-comment)
    - **Like**
      - [Create](#add-comment-like)
      - [Delete](#remove-comment-like)
- **Members**
  - [Get list](#get-members)
  - [Add member](#add-member-to-the-project)
  - [Remove member](#remove-member-from-the-project)

## What responses look like

<details>

* **Successful**
  ```
  {
      "result": true, // always "true" if successful
      "data": {}      // or []
      "errors": null  // always "null" if result is successful
  }
  ```

* **Failed (validation errors)**

  **Status code:** `400`
  ```
  {
      "result": false,
      "data": null // always "null" if failed
      "errors": [
        {
          "value": "test2@gmail.com",
          "msg": "E-mail already in use",
          "param": "email",
          "location": "body"
        },
        ...
      ]
  }
  ```

* **Failed (custom errors)**

  **Status codes:** other than `200`, `400`
  ```
  {
      "result": false,
      "data": null // always "null" if failed
      "errors": [
        "User is not authorized" // mostly contains single error
      ]
  }
  ```

</details>

---

## Authentication

First, you should get a JWT token by calling `POST` **/user/login** method with email/password payload ([Log in](#log-in)).

Response contains the token you should save and use to make requests.

<details>

* **Headers**

  - **X-TOKEN:** `<User JWT token>`

</details>

**Register**
----
Create a new user

 `POST` **/user/register**

<details>

* **Headers**

  - **Content-Type:** `application/json`


* **Body**
    ```json
     {
         "email": "test@gmail.com",
         "name": "Test User",
         "password": "test11"
     }
    ```
- `email` should be valid and unique
- `name` length at least 2 symbols
- `password` length at least 6 symbols
---

* **Success response** - `200 OK`
  ```json
  {
    "result": true,
    "data": {
        "id": "63de8d5215fc893c6f1e5dbc",
        "name": "Test",
        "email": "test5@gmail.com"
    },
    "errors": null
  }
  ```
* **Failure response** - `400 Bad Request`
  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "value": "test@gmail",
            "msg": "Invalid value",
            "param": "email",
            "location": "body"
        }
    ]
  }
  ```
</details>

---

**Log in**
----
Authorize user and return JWT token

`POST` **/user/login**

<details>

* **Headers**

  - **Content-Type:** `application/json`

  
* **Body**
    ```json
     {
        "email": "test@gmail.com",
        "password": "test"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "user": {
      "id": "63dd8048d70ca740655d684d",
      "name": "Test",
      "email": "test2@gmail.com",
      "hueColor": null
    },
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.eyJpZCI6IjYzZGQxZDMzMjM4YWI0NGMwZGU1NGExMiIsImlvdCI6MTY3NTQzNTQ4NTIwNH0=.ZzLHFnYu2Z89Finv4mRjAzheo87oBqkrJd0hIcBfg+0="
    },
    "errors": null
  }
  ```
* **Failure response** - `403 Forbidden`

  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        "Email or password is incorrect"
    ]
  }
  ```
</details>

---

**Get user**
---
`GET` **/user**

Returns user details

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63dd8048d70ca740655d684d",
        "name": "Test",
        "email": "test2@gmail.com",
        "hueColor": null
    },
    "errors": null
  }
  ```
</details>

---

**Update user**
---
`PATCH` **/user**

Update user details

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**

  * All fields are optional except for when changing password. It requires `password` + `currentPassword`.
    ```json
    {
      "name": "Junior Developer",
      "currentPassword": "qwerty",
      "password": "qwerty123456",
      "colorHue": 250
    }
    ```
  - `colorHue`: number | null
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63dd1d33238ab44c0de54a12",
        "name": "Junior Developer",
        "email": "test@gmail.com",
        "colorHue": 250
    },
    "errors": null
  }
  ```
* **Failure response**

  - `400 Bad Request`

    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        {
          "value": "",
          "msg": "Should not be empty",
          "param": "name",
          "location": "body"
        },
        {
          "value": "",
          "msg": "Password should not be empty",
          "param": "password",
          "location": "body"
        },
        {
          "value": "",
          "msg": "Should contain at least 6 symbols",
          "param": "password",
          "location": "body"
        }
      ]
    }
    ```

</details>

---

**Projects**
----
Endpoints to manage projects

**Get projects**
---
`GET` **/projects**

Returns all projects where the user is either an owner or a member 

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "items": [
            {
                "id": "63dd7e968d6ad64745e15a03",
                "name": "Common project",
                "ownerId": "63dd1d33238ab44c0de54a12"
            },
            {
                "id": "63de890018c5a3eb2107f6c4",
                "name": "My own project",
                "ownerId": "63dd1d33238ab44c0de54a12"
            }
        ],
        "count": 2
    },
    "errors": null
  }
  ```
</details>

---

**Create project**
---
`POST` **/projects**

Create new project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]


* **Body**
    ```json
    {
      "name": "My own project"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63de890018c5a3eb2107f6c4",
        "name": "My own project",
        "ownerId": "63dd1d33238ab44c0de54a12"
    },
    "errors": null
  }
  ```
* **Failure response** - `400 Bad Request`

  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "value": "",
            "msg": "Invalid value",
            "param": "name",
            "location": "body"
        }
    ]
  }
  ```
</details>

---

**Update project**
---
`PATCH` **/projects/:id**

Update project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**
    ```json
    {
      "name": "My new project name"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63de890018c5a3eb2107f6c4",
        "name": "My new project name",
        "ownerId": "63dd1d33238ab44c0de54a12"
    },
    "errors": null
  }
  ```
* **Failure response** 

    - `400 Bad Request`

    ```json
    {
      "result": false,
      "data": null,
      "errors": [
          {
              "value": "",
              "msg": "Invalid value",
              "param": "name",
              "location": "body"
          }
      ]
    }
    ```
    - `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Project is not found"
      ]
    }
    ```
</details>

---

**Delete project**
---
`DELETE` **/projects/:id**

Delete project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63de890018c5a3eb2107f6c4",
        "name": "My new project name",
        "ownerId": "63dd1d33238ab44c0de54a12"
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Project is not found"
      ]
    }
    ```
</details>

---
**Sections**
----
Endpoints to manage sections

**Get sections**
---
`GET` **/projects/:projectId/sections**

Returns all sections belonging to the specified project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "items": [
            {
                "id": "63debada0adfc89a239a915b",
                "projectId": "63dd7e968d6ad64745e15a03",
                "name": "ToDo",
                "position": 1
            },
            {
                "id": "63debae70adfc89a239a915c",
                "projectId": "63dd7e968d6ad64745e15a03",
                "name": "In Progress",
                "position": 2
            },
            {
                "id": "63debb2d0adfc89a239a915d",
                "projectId": "63dd7e968d6ad64745e15a03",
                "name": "Done",
                "position": 3
            }
        ],
        "count": 3
    },
    "errors": null
  }
  ```
</details>

---

**Create section**
---
`POST` **/projects/:projectId/sections**

Create new section

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]


* **Body**
    ```json
    {
      "name": "Do tomorrow"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63dfa9d3dd681faea7c06254",
        "projectId": "63dd7e968d6ad64745e15a03",
        "name": "Do tomorrow",
        "position": 4
    },
    "errors": null
  }
  ```
* **Failure response** - `400 Bad Request`

  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "msg": "Name should not be empty",
            "param": "name",
            "location": "body"
        }
    ]
  }
  ```
</details>

---

**Update section**
---
`PATCH` **/sections/:sectionId**

Update section

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**

    * All fields are optional
    ```json
    {
      "name": "My new section name",
      "position": 1
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63debada0adfc89a239a915b",
        "projectId": "63de890018c5a3eb2107f6c4",
        "name": "My new section name",
        "position": 1
    },
    "errors": null
  }
  ```
</details>

---

**Delete section**
---
`DELETE` **/sections/:sectionId**

Delete section

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63debb3a0adfc89a239a915e",
        "projectId": "63dd7e968d6ad64745e15a03",
        "name": "My new section",
        "position": 0
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Project is not found"
      ]
    }
    ```
</details>

---

**Move section**
---
`PATCH` **/sections/:sectionId/move**

Move section to another position

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**

  ```json
  {
    "position": 2
  }
  ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63debb3a0adfc89a239a915e",
        "projectId": "63dd7e968d6ad64745e15a03",
        "name": "My new section",
        "position": 2
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Project is not found"
      ]
    }
    ```
</details>

---

---
**Tasks**
----
Endpoints to manage tasks

**Get tasks**
---
`GET` **/tasks**

Returns all tasks from all projects available to user 

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "items": [
            {
                "id": "63e010ee9f16c8179a251b61",
                "sectionId": "63debada0adfc89a239a915b",
                "name": "To infinity and beyond",
                "position": 1,
                "description": null,
                "dueDate": null,
                "isCompleted": false,
                "assignees": [],
                "section": {
                    "id": "63f3b03345bad859ad22be8d",
                    "projectId": "63f39831506ccb376915c91d",
                    "name": "q",
                    "position": 1,
                    "project": {
                        "name": "eerer"
                    }
                }
            }
        ],
        "count": 1
    },
    "errors": null
  }
  ```
</details>

---

**Get section tasks**
---
`GET` **/sections/:sectionId/tasks**

Returns all tasks belonging to the specified section

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "items": [
            {
                "id": "63e010ee9f16c8179a251b61",
                "sectionId": "63debada0adfc89a239a915b",
                "name": "To infinity and beyond",
                "position": 1,
                "description": null,
                "dueDate": null,
                "isCompleted": false,
                "assignees": []
            }
        ],
        "count": 1
    },
    "errors": null
  }
  ```
</details>

---

**Create task**
---
`POST` **/sections/:sectionId/tasks**

Create new task

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]


* **Body**
    ```json
    {
    "name": "To infinity and beyond"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e010ee9f16c8179a251b61",
        "sectionId": "63debada0adfc89a239a915b",
        "name": "To infinity and beyond",
        "position": 1,
        "description": null,
        "dueDate": null,
        "isCompleted": false,
        "assignees": []
    },
    "errors": null
  }
  ```
* **Failure response** - `400 Bad Request`

  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "msg": "Name should not be empty",
            "param": "name",
            "location": "body"
        }
    ]
  }
  ```
</details>

---

**Update task**
---
`PATCH` **/tasks/:taskId**

Update task

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**

  * All fields are optional
    ```json
    {
    "name": "To infinity and beyond",
    "position": 1,
    "description": "Buzz Lighter!",
    "dueDate": "2100-02-06T06:34:56.000Z",
    "isCompleted": false,
    "assignees": []
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e010ee9f16c8179a251b61",
        "sectionId": "63debada0adfc89a239a915b",
        "name": "To infinity and beyond",
        "position": 1,
        "description": "Buzz Lighter!",
        "dueDate": "2100-02-06T06:34:56.000Z",
        "isCompleted": false,
        "assignees": []
    },
    "errors": null
  }
  ```
</details>

---

**Delete task**
---
`DELETE` **/tasks/:taskId**

Delete task

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63debb3a0adfc89a239a915e",
        "sectionId": "63dd7e968d6ad64745e15a03",
        "name": "My new task",
        "position": 0,
        "description": "Buzz Lighter!",
        "dueDate": "2100-02-06T06:34:56.000Z",
        "isCompleted": false,
        "assignees": []
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Task is not found"
      ]
    }
    ```
</details>

---

**Move task**
---
`PATCH` **/tasks/:taskId**

Move task to another position or section

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**

  * All fields are optional
  ```json
  {
    "position": 2,
    "sectionId": "63dd7e968d6ad64745e15a03"
  }
  ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63debb3a0adfc89a239a915e",
        "sectionId": "63dd7e968d6ad64745e15a03",
        "name": "My new task",
        "position": 2,
        "description": "Buzz Lighter!",
        "dueDate": "2100-02-06T06:34:56.000Z",
        "isCompleted": false,
        "assignees": []
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Task is not found"
      ]
    }
    ```
</details>

---

**Add task assignee**
---
`POST` **/tasks/:taskId/assignee**

Assign member to task

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e28f524f52309bf533d217",
        "member": {
            "id": "63dd84a201fe8817ec6febcc",
            "user": {
                "id": "63dd8048d70ca740655d684d",
                "name": "Test",
                "email": "test2@gmail.com"
            }
        }
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Member is not found"
      ]
    }
    ```
</details>

**Remove task assignee**
---
`DELETE` **/tasks/:taskId/assignee/:assigneeId**

Remove assigned member from task

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e28e5d1995e8339b59e74b",
        "member": {
            "id": "63dd84a201fe8817ec6febcc",
            "user": {
                "id": "63dd8048d70ca740655d684d",
                "name": "Test",
                "email": "test2@gmail.com"
            }
        }
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Assignee is not found"
      ]
    }
    ```
</details>

---

**Get section tasks**
---
`GET` **/sections/:sectionId/tasks**

Returns all tasks belonging to the specified section

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "items": [
          {
            "id": "63e3efcb96a5f9aa450143bb",
            "text": "This is an amazing comment!",
            "user": {
              "id": "63dd1d33238ab44c0de54a12",
              "name": "Test User",
              "email": "test@gmail.com"
            },
            "likes": 0,
            "createdAt": "2023-02-08T18:54:03.027Z"
          }
        ],
        "count": 1
    },
    "errors": null
  }
  ```
</details>

---

---

**Create task comment**
---
`POST` **/tasks/:taskId/comments**

Create task comment

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**
    ```json
    {
      "text": "This is an amazing comment!"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e3efcb96a5f9aa450143bb",
        "text": "This is an amazing comment!",
        "user": {
            "id": "63dd1d33238ab44c0de54a12",
            "name": "Test User",
            "email": "test@gmail.com"
        },
        "likes": 0,
        "createdAt": "2023-02-08T18:54:03.027Z"
    },
    "errors": null
  }
  ```
* **Failure response**

  `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Task is not found"
      ]
    }
    ```
  `400 Bad Request`
  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "msg": "Comment text should not be empty",
            "param": "text",
            "location": "body"
        }
    ]
  }
  ```
</details>

---

**Update task comment**
---
`PATCH` **/comments/:commentId**

Update task

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

* **Body**

    ```json
    {
      "text": "Wish you good luck!"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e3efe396a5f9aa450143bc",
        "text": "Wish you good luck!",
        "user": {
            "id": "63dd1d33238ab44c0de54a12",
            "name": "Test User",
            "email": "test@gmail.com"
        },
        "likes": 0,
        "createdAt": "2023-02-08T18:54:27.646Z",
        "updatedAt": "2023-02-08T18:58:01.948Z"
    },
    "errors": null
  }
  ```

* **Failure response** `400 Bad Request`
  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "value": "",
            "msg": "Comment text should not be empty",
            "param": "text",
            "location": "body"
        }
    ]
  }
  ```

</details>

---

**Remove task comment**
---
`DELETE` **/comments/:commentId**

Delete task comment

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e3efe396a5f9aa450143bc",
        "text": "Wish you good luck!",
        "user": {
            "id": "63dd1d33238ab44c0de54a12",
            "name": "Test User",
            "email": "test@gmail.com"
        },
        "likes": 0,
        "createdAt": "2023-02-08T18:54:27.646Z",
        "updatedAt": "2023-02-08T18:58:01.948Z"
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Comment is not found"
      ]
    }
    ```
</details>

---

**Add comment like**
---
`POST` **/comments/:commentId/likes**

Add comment like

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e2c456be9be1eefe482a92",
        "likes": 2
    },
    "errors": null
  }
  ```
* **Failure response**

  `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Comment is not found"
      ]
    }
    ```

</details>

---

**Remove comment like**
---
`DELETE` **/comments/:commentId/likes**

Remove comment like

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e2c456be9be1eefe482a92",
        "likes": 1
    },
    "errors": null
  }
  ```
* **Failure response**

  `404 Not Found`
    ```json
    {
      "result": false,
      "data": null,
      "errors": [
        "Comment is not found"
      ]
    }
    ```

</details>

---

**Members**
----
Endpoints to manage members

**Get members**
---
`GET` **/projects/:projectId/members**

Returns all members belonging to the specified project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "items": [
            {
                "id": "63dd84a201fe8817ec6febcc",
                "project": {
                    "id": "63dd7e968d6ad64745e15a03",
                    "name": "Common project",
                    "ownerId": "63dd1d33238ab44c0de54a12"
                },
                "user": {
                    "id": "63dd8048d70ca740655d684d",
                    "name": "Test",
                    "email": "test2@gmail.com"
                }
            }
        ],
        "count": 1
    },
    "errors": null
  }
  ```
</details>

---

**Add member to the project**
---
`POST` **/projects/:projectId/members**

Add member to the project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]


* **Body**
    ```json
    {
      "email": "test3@gmail.com"
    }
    ```
---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e1532ab04f77e85deade4b",
        "project": {
            "id": "63dd7e968d6ad64745e15a03",
            "name": "Common project",
            "ownerId": "63dd1d33238ab44c0de54a12"
        },
        "user": {
            "id": "63de8cfd12005599ec895871",
            "name": "Test",
            "email": "test4@gmail.com"
        }
    },
    "errors": null
  }
  ```
* **Failure response** - `400 Bad Request`

  ```json
  {
    "result": false,
    "data": null,
    "errors": [
        {
            "value": "test4",
            "msg": "Email should be valid",
            "param": "email",
            "location": "body"
        }
    ]
  }
  ```
</details>

---

**Remove member from the project**
---
`DELETE` **/members/:memberId**

Remove member from the project

<details>

* **Headers**

  - **Content-Type:** `application/json` [required]
  - **X-TOKEN:** `<User JWT token>` [required]

---

* **Success response** - `200 OK`

  ```json
  {
    "result": true,
    "data": {
        "id": "63e1532ab04f77e85deade4b",
        "project": {
            "id": "63dd7e968d6ad64745e15a03",
            "name": "Common project",
            "ownerId": "63dd1d33238ab44c0de54a12"
        },
        "user": {
            "id": "63de8cfd12005599ec895871",
            "name": "Test",
            "email": "test4@gmail.com"
        }
    },
    "errors": null
  }
  ```
* **Failure response** `404 Not Found`
    ```json
    {
    "result": false,
    "data": null,
    "errors": [
        "Member is not found"
    ]
  }
    ```
</details>

---
