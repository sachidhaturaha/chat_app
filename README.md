# Chat Application

This repository contains the source code for a simple yet functional chat application. It allows users to send and receive messages in real-time, manage friend requests, and maintain a list of contacts.

## Features

- User registration and login
- Real-time messaging
- Adding and removing friends
- Viewing and managing friend requests
- Live updates of messages using WebSockets

## Technologies Used

- Node.js
- Express.js
- Bootstrap
- MySQL [phpmyadmin]
- Socket.IO
- React
- Axios
- JWT for authentication

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

What things you need to install the software and how to install them:

## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js**: Download and install Node.js from [Node.js official site](https://nodejs.org/en/download/). Node.js is necessary to run the backend server and the React application.
- **Git**: Download and install Git from [Git's official site](https://git-scm.com/downloads). Git is used for version control and for cloning the repository.
- **npm**: npm is distributed with Node.js, which means that when you download Node.js, you automatically get npm installed on your computer. npm is necessary to manage the project's dependencies.
- **MySQL**: Download and install MySQL from [MySQL's official site](https://dev.mysql.com/downloads/). MySQL is used as the database for storing user and chat data.

Ensure that you have the latest versions of these software packages to avoid any compatibility issues with the project.

## Installation

- Clone the repository:

git clone https://github.com/sachidhaturaha/chat_app.git

- Install backend dependencies:

cd Backend
npm install

- Install frontend dependencies:

cd frontend
npm install

- Create a MySQL database and run the provided SQL scripts to create required tables.

- Start the backend server:

node serverN
OR
nodemon serverN

- Start the React application:

cd frontend
npm start

The application should now be running on http://localhost:3000.


## Usage

- Register for the chat app if you are a new user and then login to your dashboard or login directly if you are already a user.
- After logging in, you will get to see the dashboard, where you can check for your friend list, requests you have got, and the remaining people available on chit-chat.
- You can either chat with your friends or unfriend them if you don't want them in your friend list.
- You can either send a friend request to people you want to be friends with, or withdraw sent requests from people who you mistakenly sent request but don't want them as a friend.
- You can check the list of people who have sent friend requests to you and either accept or decline their request.

