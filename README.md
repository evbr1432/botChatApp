# botChatApp
Little chat app to convert text to speech in a fun way. 
Deployment:
Log into EC2 instance and run "cd devops", "docker-compose up -d"
Docker-compose and the watchtower container will do the rest. 
View the Devops and UML diagrams for more information. 
Created by: Evan Brookens

TO DO:
- The username ask prompt can be A LOT better. (Could be seprate page or complete user/pw login)
- Mobile users have the hamburger menu get in the way
- Unit tests
- More error checking
- Differant colors per user (rotate through all main colors)
- Fix caching
- Help message sends before the client (so it looks like the message sent after the help message arrived)
- Case insensitive commands
- Commands could use a redesgin 
- Split Backend, frontend, nginx, and database into seprate containers

