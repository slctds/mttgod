import logging
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes

# Вставьте ваш токен бота здесь
TOKEN = '7044779231:AAHo4IVpOP_m7DcwQwhO9TOvrwN3WucvPRg'
WEB_URL = 'http://212.86.115.132'

# Логирование
logging.basicConfig(
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    level=logging.INFO
)
logger = logging.getLogger(__name__)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    user_first_name = update.message.from_user.first_name
    message = (f"Привет, {user_first_name}! Этот тренажер поможет тебе запомнить и отработать множество полезных вещей, "
               "такие как диапазоны, шансы банка, эквити, комбинаторика и т.д. Все то, на что обычно не хватает времени, "
               "но что помогает стать Топ-регом.")
    
    keyboard = [
        [InlineKeyboardButton("Начать", web_app=WebAppInfo(url=WEB_URL))],  # Используем WebAppInfo для открытия сайта
        [InlineKeyboardButton("Оплатить", callback_data='pay')],
        [InlineKeyboardButton("Выйти", callback_data='exit')]
    ]

    reply_markup = InlineKeyboardMarkup(keyboard)

    await update.message.reply_text(message, reply_markup=reply_markup)

async def button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    query = update.callback_query
    await query.answer()

    if query.data == 'pay':
        await query.edit_message_text(text="Для оплаты перейдите по следующей ссылке: [Оплатить](https://example.com)", parse_mode='Markdown')
    elif query.data == 'exit':
        await query.edit_message_text(text="Спасибо за использование тренажера. До скорых встреч!")

def main() -> None:
    # Создание Application
    application = Application.builder().token(TOKEN).build()

    # Регистрация обработчиков команд и нажатий кнопок
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CallbackQueryHandler(button))

    # Запуск бота
    application.run_polling()

if __name__ == '__main__':
    main()
