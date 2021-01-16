# PantanoBot

## Instalation
- You must have Docker installed in your pc.
- Start docker-compose and the application:
```ssh
  docker-compose up
  npm run d
```
## How to use:
- Reply to a message using the `/ats` command.
- To retrieve a summary use the command `/resumen period` where period is by default 'hoy' but you can use: 'ayer' or '*' to fetch messages from the beginning of the month.

## Available commands:
- `/ats`: Used to add a message to the summary.
- `/resumen period`: Ask the bot for a summary of the.
- `/help`: See the help.
- `/start`: Start the bot.