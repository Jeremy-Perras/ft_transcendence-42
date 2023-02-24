# PONG
This is our ft_transcendence, the last project from the common core of 42 school<br />
The project is the result of the collaboration between [Sebastien Waegeneire](https://github.com/SebastienWae) and [Jenny Eulliot](https://github.com/Ptitjen)<br/>

uses the following technologies:
+ React 
+ NestJS  
+ PostgreSQL 
<br/>


<details>
<summary> Login page </summary>
<img width="2672" alt="Screen Shot 2023-02-24 at 2 23 49 PM" src="https://user-images.githubusercontent.com/89851173/221190250-028ff215-0fa0-49b8-9415-610fb90e2878.png">
</details>

<details>
<summary> Profil page </summary>
<img width="2672" alt="Screen Shot 2023-02-24 at 2 26 57 PM" src="https://user-images.githubusercontent.com/89851173/221190388-9337c283-1afc-4503-92d2-e31db693a57f.png">
</details>

<details>
<summary> Game page and Channel chating </summary>
<img width="2672" alt="Screen Shot 2023-02-24 at 2 26 40 PM" src="https://user-images.githubusercontent.com/89851173/221190522-644b8ed6-e9f1-4743-a622-278ddab55279.png">
</details>

<details>
<summary> Channel setting </summary>
<img width="2672" alt="Screen Shot 2023-02-24 at 2 26 11 PM" src="https://user-images.githubusercontent.com/89851173/221190871-74d928ea-388e-41a1-a6f3-51d5576f6d6b.png">
</details>

### EnvFile?
The file has to be named .env and it has to have this path ft_transcendence-42/ :
+ POSTGRES_PASSWORD=?
+ POSTGRES_USER=?
+ POSTGRES_DB=?
+ POSTGRES_URL=?
+ SESSION_SECRET=?
+ IP=?

The file has to be named oauth42.env and it has to have this path ft_transcendence-42/ :
+ PUBLIC_OAUTH42_CALLBACK_URL=?
+ PUBLIC_OAUTH42_CLIENT_ID=?
+ OAUTH42_CLIENT_SECRET=? <br/>

You can find them by creating an application that allows you to use the 42 API
### How to launch ?
```
docker compose up
```
