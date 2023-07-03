const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const koaBody = require('koa-body').default;
const uuid = require('uuid');

const fullTickets = [
  {
    id: 1, // идентификатор (уникальный в пределах системы)
    name: '1 Поменять краску в принтере', // краткое описание
    description: '', // полное описание
    status: true, // boolean - сделано или нет
    created: '10.03.19 08:40', // дата создания (timestamp)
  },
  {
    id: 2, // идентификатор (уникальный в пределах системы)
    name: '2 Переустановить Windows, ПК-Hall24', // краткое описание
    description: 'Описание второго тикета', // полное описание
    status: false, // boolean - сделано или нет
    created: '10.03.19 08:40', // дата создания (timestamp)
  },
  {
    id: 3, // идентификатор (уникальный в пределах системы)
    name: '3 Установить обновление KB-XXX', // краткое описание
    description: 'Вышло критическое обновление для Windows, нужно поставить обновления', // полное описание
    status: true, // boolean - сделано или нет
    created: '10.03.19 08:40', // дата создания (timestamp)
  },
]


const app = new Koa();
const router = new Router();

app.use(cors());

app.use(koaBody({
    text: true,
    urlencoded: true,
    multipart: true,
    json: true,
}));

app.use(async ctx => {
    const met = ctx.request['method'];
    const { method, id } = ctx.request.query;
    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');

    if (!method) {
        ctx.response.body = 'server response';
    };
    switch (method) {
      // GET
        case 'allTickets':
            const tickets = allTickets(fullTickets);
            ctx.body = { tickets };

            return;
        case 'ticketById':
            const ticket = fullTickets.find(el => el.id == id);
            const { description } = ticket;
            ctx.body = {description};
    
            return;
      // POST
        case 'createTicket':
          if (met === 'POST') {
            const { name, description, status } = ctx.request.body;
            const ticketID = uuid.v4();
            const ticketDate = new Date();
            const newTicket = {
              id: ticketID,
              name: name,
              description: description,
              status: status,
              created: ticketDate,
            };

            fullTickets.push(newTicket);
            ctx.status = 200;
            ctx.body = newTicket;

            return
          };
          ctx.status = 400;
          ctx.body = {error: "method should be 'POST'"};
            return;

      // DELETE  
        case 'removeTicket':
          if (met === 'DELETE' && id !== null) {
            const ticket = fullTickets.find(el => el.id == id);
            const index = fullTickets.indexOf(ticket);

            if (index === -1) {
              ctx.status = 400;
              ctx.body = {error: 'wrong id for remove'};
              return;
            };
            const removedArr = fullTickets.splice(index,1);
            const removed = removedArr[0];

            ctx.body = {removed};

            ctx.status = 200;
            return;
          };
          ctx.status = 400;
          ctx.body = {error: "method should be 'DELETE'"};
            return;
      // PUT
        case 'ticketComplete':
          if (met === 'PUT' && id !== null) {
            const ticket = fullTickets.find(el => el.id == id);

            if (!ticket) {
              ctx.status = 400;
              ctx.body = {error: 'wrong id'};
              return;
            };

            const status = ticket.status = !ticket.status;

            ctx.status = 200;
            ctx.body = { status: status };

            return;
          };
          ctx.status = 400;
          ctx.body = {error: "method should be 'PUT'"};
          return;
        
        case 'ticketEdit':
          if (met === 'PUT' && id !== null) {
            const ticket = fullTickets.find(el => el.id == id);
            if (!ticket) {
              ctx.status = 400;
              ctx.body = {error: 'wrong id'};
              return;
            };
            const { name, description } = ctx.request.body;
            ticket.name = name;
            ticket.description = description;

            ctx.status = 200;
            ctx.body = { ticket };

            return;
          };

          ctx.status = 400;
          ctx.body = {error: "method should be 'PUT'"};
          return;

        default:
            ctx.response.status = 404;
            return;
    }
});

// функция для создания массива тикетов без описания
function allTickets(fullTickets) {
  const tickets = [];
  for (let ticket of fullTickets) {
    tickets.push( { id: ticket['id'], name: ticket['name'], status: ticket['status'], created: ticket['created'] });
  };
  return tickets;
};

app.use((ctx) => {
    console.log(ctx.headers);
});

app
  .use(router.routes())
  .use(router.allowedMethods());

const port = 7070;

app.listen(port, (err) => {
    if (err) {
        confirm.log(err);
        return;
    };

    console.log('Сервер запущен порт: ' + port);
});