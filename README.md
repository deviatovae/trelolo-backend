## Production
https://trelolo.onrender.com

## Usage

- **User**
    - [Register (sign up)](#register)
    - [Log in](#log-in)

## What responses look like

<details>

* **Successful**
  ```
  {
      "result": true, // always "true" if successful
      "data": {}      // or []
      "errors": []    // always "empty" if result is successful
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
    "errors": []
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
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.eyJpZCI6IjYzZGQxZDMzMjM4YWI0NGMwZGU1NGExMiIsImlvdCI6MTY3NTQzNTQ4NTIwNH0=.ZzLHFnYu2Z89Finv4mRjAzheo87oBqkrJd0hIcBfg+0="
    },
    "errors": []
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
