# 87th-street-book-club-discord-bot
A discord bot used to complete different tasks for the 87th street book club

# How to develop:

Download a text editor. I like to use https://code.visualstudio.com/

Install git from https://git-scm.com/download/win

Open command prompt (terminal) and navigate to where you want to save the project
  - Commands for windows command prompt
      - cd {folder-name} (Move to whatever folder you specify)
      - dir (Show all files in a folder)
      - mkdir (Makes a new folder)

Run the command 
  - git clone https://github.com/daharri/87th-street-book-club-discord-bot.git

Go to project folder
  - cd ./87th-street-book-club-discord-bot
  
Run the command
  - npm install

Running the project
   - npm run dev  (Use this command for development)
   - npm run start

THIS WILL NOT WORK WITHOUT THE BOT TOKEN. THE TOKEN IS A SECRET 🤫🤫🤫


# How to add code

Things that will need to be added before you can test

1. Create a new Application through discord so that you can have a bot for testing code.
2. Create a bot wwithin that application and save your bot token.
   - A link to help with the above steps: https://discordpy.readthedocs.io/en/latest/discord.html
      
3. Once the bot is created, create a file named `.env` at the top level of the project directory.
4. Inside, put `DISCORD_TOKEN="This is where your token goes"`

5. In the savedData directory, go to the settings file and add your test channel id to the authorizedChannel Array.

   - I've created a testing channel if you would like to use that: https://discord.gg/RkSZKtp
   - If you choose to do this, You can skip step 5 and just add your testing bot to the channel

You can now run the commands
  - git checkout master
  - git pull
  - npm i
  - npm run dev
  
Make sure you have git installed

6. After you have finished making your changes and you want to put in a pull request, run the following commands in your projects terminal window:
   - git checkout -b `Enter a name for your branch` (This can be anything you want)
   - git add .
   - git commit -m "Enter a message to go with your new commit" (This can also be whatever you want)
   - git push
     - If you receive this message `fatal: The current branch test has no upstream branch`, run the next command
        - git push --set-upstream origin `Enter your branch name here`
        
7. Go back to the github repo and put in a pull request: https://github.com/daharri/87th-street-book-club-discord-bot/pulls
    - Click New pull request
    - Select your branch name from the compare dropdown
    - Click create pull request
    - Click create pull request again
    
If it is approved, your changes will be added to the bots code.
