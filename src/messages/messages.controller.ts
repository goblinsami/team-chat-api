import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  Patch,
  Delete,
} from '@nestjs/common';

@Controller('messages')
export class MessagesController {
  private messages = [
    {
      id: 1,
      title: 'hola que tal',
    },
    {
      id: 2,
      title: 'bien, gracias',
    },
  ];

  @Get()
  findAll() {
    return this.messages;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messages.find((message) => message.id === Number(id));
  }

  @Post()
  create(@Body() body: any) {
    const message = {
      id: this.messages.length + 1,
      title: body.title,
    };
    this.messages.push(message);
    return message;
  }
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    const message = this.messages.find((message) => message.id === Number(id));
    if (!message) {
      return;
    }
    message.title = body.title;

    return message;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    this.messages = this.messages.filter(
      (message) => message.id !== Number(id),
    );
    return {
      deleted: true,
    };
  }
}
