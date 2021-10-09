-- Migrations should be idempotent,
-- able to run 1+ times in succession to the same effect

-- see https://www.graphile.org/postgraphile/smart-tags/

drop schema if exists main cascade;
create schema main;

create table main.user (
    id    serial primary key,
    alias varchar(40) not null unique
);

create table main.message (
    id        serial primary key,
    content   text not null,
    sent_at   timestamptz not null default now(),
    sender_id int not null references main.user(id),
    prompt_id int references main.message(id) 
);
create index on main.message (sender_id);
create index on main.message (prompt_id);
comment on column main.message.prompt_id is 
    E'Opposite of reply. See https://english.stackexchange.com/a/303288';

-- see https://www.graphile.org/postgraphile/enums/
create table main.notification_status (
    type text primary key,
    description text
);
comment on table main.notification_status is E'@enum';
insert into main.notification_status (type, description) values
    ('UNREAD', 'Recipient has not acknowledged message.'),
    ('READ', 'Recipient has read message.'),
    ('ARCHIVED', 'Recipient wants this message hidden from their inbox.');

create table main.notification (
    id           serial primary key,
    message_id   int not null references main.message(id),
    recipient_id int not null references main.user(id),
    status       text not null default 'UNREAD' references main.notification_status(type)
);
create index on main.notification (message_id);
create index on main.notification (recipient_id);
