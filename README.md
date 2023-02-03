## Production
https://trelolo.onrender.com

## Usage

- **User**
    - [Register (sign up)](#register)
    - [Log in](#log-in)

**Register**
----
Create a new user

 `POST` **/user/register**

<details>

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
    "result": true  
  }
  ```
* **Failure response** - `400 Bad Request`
  ```json
  {
    "errors": [
        {
            "value": "test@email",
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

* **Body**
    ```json
     {
        "email": "test@gmail.com",
        "password": "test"
    }
    ```
- `email` should be valid
- `password`
---

* **Success response** - `200 OK`
  ```json
  {
    "result": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Imp3dCJ9.eyJpZCI6IjYzZGQxZDMzMjM4YWI0NGMwZGU1NGExMiIsImlvdCI6MTY3NTQzNTQ4NTIwNH0=.ZzLHFnYu2Z89Finv4mRjAzheo87oBqkrJd0hIcBfg+0="
  }
  ```
* **Failure response** - `403 Forbidden`
  ```json
  {
    "error": "Email or password is incorrect"
  }
  ```
</details>
