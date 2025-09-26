Повний проект TaskForge: Архітектура, код та розгортання
І. Резюме та архітектурний план проекту
1.1. Вступ до проекту: "TaskForge"
"TaskForge" — це повнофункціональний односторінковий веб-додаток (SPA) для управління персональними завданнями. Він надає користувачам інтуїтивно зрозумілий інтерфейс для реєстрації, автентифікації та керування списками завдань у безпечному середовищі. Проект реалізований з використанням сучасних інженерних практик і служить як готове рішення, так і освітній ресурс для вивчення розробки програмного забезпечення.

Основні функціональні можливості:

Автентифікація користувачів: Система реєстрації та входу з хешуванням паролів (bcrypt) та керуванням сесій через JWT.
Управління завданнями (CRUD):
Створення завдань із заголовком та описом.
Перегляд списку завдань.
Редагування тексту та статусу завдань.
Видалення завдань.
Авторизація та ізоляція даних: Гарантується доступ користувача виключно до власних даних. API блокує спроби доступу до чужих завдань.
1.2. Вибір технологічного стеку: PERN Stack
Для реалізації "TaskForge" обрано стек PERN (PostgreSQL, Express.js, React, Node.js), який поєднує потужність реляційної бази даних з гнучкістю JavaScript-серверного та клієнтського коду.

PostgreSQL: Об'єктно-реляційна СУБД з відкритим вихідним кодом, що забезпечує високу надійність, відповідність стандартам SQL та гарантії цілісності даних (ACID). Використання реляційної моделі змушує розробника заздалегідь продумувати структуру даних, що сприяє формуванню "data-first" мислення.
Express.js: Мінімалістичний веб-фреймворк для Node.js, який надає інструменти для створення RESTful API, управління маршрутизацією та обробкою HTTP-запитів.
React: JavaScript-бібліотека для створення користувацьких інтерфейсів з компонентною архітектурою, що дозволяє будувати складні UI з високою можливістю повторного використання.
Node.js: Середовище виконання JavaScript на сервері, що уможливлює створення швидких та масштабованих мережевих додатків.
Вибір PERN стеку був стратегічним рішенням, оскільки реляційна модель PostgreSQL краще підходить для додатків, де цілісність даних є першочерговою. Зовнішні ключі гарантують, що завдання не можуть існувати без прив'язки до користувача, запобігаючи появі "осиротілих" даних.

1.3. Високорівнева архітектура системи
"TaskForge" побудований за класичною трирівневою архітектурою, яка чітко розділяє відповідальності між клієнтом, сервером та базою даних.

Клієнт (Frontend): Односторінковий додаток на React, який відповідає за відображення даних та взаємодію з користувачем. Він не містить бізнес-логіки, а лише надсилає запити до сервера та відображає отримані дані.
Сервер (Backend): RESTful API на Node.js та Express.js, який обробляє HTTP-запити, реалізує бізнес-логіку (наприклад, перевірку прав доступу), валідує вхідні дані та взаємодіє з базою даних.
База даних (Persistence Layer): PostgreSQL, яка зберігає дані користувачів та завдань у чітко визначених таблицях із зв'язками між ними.
ІІ. Детальний опис кодової бази
2.1. Структура проекту
Проект поділений на дві основні директорії: client (фронтенд) та server (бекенд).

TaskForge/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── app.js
│   └── package.json
└── README.md
2.2. Фронтенд (React)
Фронтенд реалізований як SPA на React з використанням функціональних компонентів та хуків. Основні компоненти включають:

AuthForm: Форма реєстрації та входу.
TaskList: Список завдань користувача.
TaskForm: Форма для створення та редагування завдань.
Приклад коду компонента TaskList:

jsx
import React, { useEffect, useState } from 'react';
import { getTasks } from '../services/taskService';
 
const TaskList = () => {
  const [tasks, setTasks] = useState([]);
 
  useEffect(() => {
    const fetchTasks = async () => {
      const data = await getTasks();
      setTasks(data);
    };
    fetchTasks();
  }, []);
 
  return (
    <div>
      <h2>Список завдань</h2>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.title} - {task.completed ? 'Виконано' : 'Не виконано'}
          </li>
        ))}
      </ul>
    </div>
  );
};
 
export default TaskList;
2.3. Бекенд (Node.js + Express.js)
Бекенд реалізований як RESTful API з використанням Express.js та PostgreSQL. Основні модулі включають:

models/task.js: Модель завдань для взаємодії з базою даних.
controllers/taskController.js: Контролери для обробки запитів CRUD.
routes/taskRoutes.js: Маршрути для завдань.
middleware/auth.js: Мідлвар для перевірки JWT.
Приклад коду моделі Task:

javascript
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
 
const Task = sequelize.define('Task', {
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  completed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
});
 
module.exports = Task;
Приклад коду контролера taskController:

javascript
const Task = require('../models/task');
 
exports.createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const task = await Task.create({
      title,
      description,
      userId: req.user.id
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
 
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.findAll({ where: { userId: req.user.id } });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
ІІІ. Інструкції з розгортання
3.1. Вимоги до середовища

Node.js (версія 14+)
PostgreSQL (версія 12+)
npm або yarn
3.2. Кроки розгортання

Встановлення залежностей:
bash
# В директорії client
cd client
npm install
 
# В директорії server
cd server
npm install
Налаштування бази даних:
Створіть базу даних PostgreSQL та налаштуйте з'єднання у файлі server/config/db.js.
Запустіть міграції (якщо використовуєте Sequelize) або створіть таблиці вручну.
Налаштування змінних середовища:
Створіть файл .env у директорії server з наступними змінними:
JWT_SECRET=your_jwt_secret
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
Запуск додатку:
Відкрийте два термінали: один для клієнта, інший для сервера.
Запустіть сервер:
bash
cd server
npm start
Запустіть клієнт:
bash
cd client
npm start
Доступ до додатку:
Відкрийте браузер та перейдіть за адресою http://localhost:3000.
IV. Заключення
"TaskForge" — це повнофункціональний додаток для управління завданнями, реалізований з використанням сучасних технологій та інженерних практик. Проект служить як готове рішення для персонального використання, так і освітній ресурс для вивчення розробки веб-додатків. Детальна документація та кодова база дозволяють легко розгорнути додаток та адаптувати його під власні потреби.# TaskForge
