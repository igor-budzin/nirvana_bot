/**
 * Functions to reply with a single sticker with buttons or
 * with a carousel of such blocks + helpers
 * */

const i18n = require('i18n');
const templates = require('./templates');

function parseAnswer(botReply) {
  try {
    const output = { text: false, sticker: false };

    if (botReply.includes('{stickers}')) {
      const [phrase, oneOrSeveralStickers] = botReply.split('{stickers}');
      output.text = phrase;
      let stickers = [];
      if (oneOrSeveralStickers.includes('|')) {
        stickers = oneOrSeveralStickers.split('|');
        const randStickerIndex = Math.floor(Math.random() * stickers.length);
        output.sticker = stickers[randStickerIndex];
      } else {
        output.sticker = oneOrSeveralStickers;
      }
    } else {
      output.text = botReply;
    }
    return output;
  } catch (error) {
    console.log(`\n⚠ parseAnswer():\n${error}`);
    return false;
  }
}

/**
 * Gets answer from our NLP model, parses it to get text and/or
 * sticker and sends a platform-specific payload
 * @param {object} session Object to interact with BF platform
 * @param {string} answer Reply from npl.js,
 * @param {object} stickersObj Object with info for stickers (phrase, play name/url/audio etc)
 */
function sendAnswer(session, answer, stickersObj) {
  try {
    const { text, sticker } = parseAnswer(answer);
    if (text) session.send(text);
    if (sticker) {
      const ourCard = templates.getCard(session, sticker, stickersObj);
      session.send(ourCard);
    }
    return true;
  } catch (error) {
    console.log(`\n⚠ sendAnswer():\n${error}`);
    return false;
  }
}

/**
 * Sends a single play or a carousel/list of plays found by ES
 * for a given phrase
 * @param {object} session Object to interact with BF platform
 * @param {array} esFoundPlays A list of plays' titles
 * @param {object} stickersObj Object with info for stickers (phrase, play name/url/audio etc)
 */
function presentPlays(session, esFoundPlays, stickersObj, showingNext = false) {
  try {
    if (!showingNext) {
      if (esFoundPlays.length > 1 && esFoundPlays.length <= 3) {
        session.send(i18n.__('relevant_plays', esFoundPlays.length));
      } else if (esFoundPlays.length > 3) {
        session.send(i18n.__('relevant_plays_first_3', esFoundPlays.length));
      } else {
        session.send(i18n.__('relevant_play'));
      }
    } else {
      const replyVariants = [i18n.__('here_they_are'), i18n.__('no_problem'), i18n.__('voila')];
      const ourVariant = Math.floor(Math.random() * replyVariants.length);
      session.send(replyVariants[ourVariant]);
    }

    const carousel = templates.getCarousel(session, esFoundPlays, stickersObj);
    session.send(carousel);
    return true;
  } catch (error) {
    console.log(`\n⚠ presentPlays():\n${error}`);
    return false;
  }
}

/**
 * Sends an mp3 with the play needed to Telegram
 * @param {object} session Object to interact with BF platform
 * @param {string} play Name of the play
 * @param {object} stickersObj Object with info for stickers (phrase, play name/url/audio etc)
 */
function sendAudio(session, playId, stickersObj) {
  try {
    const audioMsg = templates.getAudioMsg(session, playId, stickersObj);
    session.send(audioMsg);
    return true;
  } catch (error) {
    console.log(`\n⚠ sendAudio():\n${error}`);
    return false;
  }
}

/**
 * Returns a card with random phrase
 * @param {object} session Object to interact with BF platform
 * @param {object} stickersObj Object with info for stickers (phrase, play name/url/audio etc)
 */
function randomPhrase(session, stickersObj) {
  try {
    const phrasesIds = Object.keys(stickersObj).filter(id => !stickersObj[id].isAPlay);
    const randomIdPos = Math.floor(Math.random() * phrasesIds.length);
    const ourCard = templates.getCard(session, phrasesIds[randomIdPos], stickersObj);
    session.send(ourCard);
    return true;
  } catch (error) {
    console.log(`\n⚠ randomPhrase():\n${error}`);
    return false;
  }
}

/**
 * Info and links about Les' Poderviansky and me
 * @param {object} session Object to interact with BF platform
 */
function feedback(session) {
  try {
    const feedbackMsg = templates.getFeedbackInfo(session);
    session.send(feedbackMsg);
    return true;
  } catch (error) {
    console.log(`\n⚠ feedback():\n${error}`);
    return false;
  }
}

/**
 * General info about the chatbot
 * @param {object} session Object to interact with BF platform
 */
function getFaq(session) {
  try {
    const info = templates.faq(session);
    session.send(info);
    return true;
  } catch (error) {
    console.log(`\n⚠ getFaq():\n${error}`);
    return false;
  }
}

module.exports = {
  sendAnswer,
  presentPlays,
  sendAudio,
  randomPhrase,
  feedback,
  getFaq,
};
