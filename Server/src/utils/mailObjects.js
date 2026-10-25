const { log } = require('console');
const fs = require('fs');

const registerTemplate = fs.readFileSync(__dirname + '/register.html', 'utf8');
const forgotTemplate = fs.readFileSync(__dirname + '/forgot.html', 'utf8');
const postTemplate = fs.readFileSync(__dirname + '/newPost.html', 'utf8');
const matchTemplate = fs.readFileSync(__dirname + '/matchTemplate.html', 'utf8');

const registerMail = (user) => {
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
  if (!frontendUrl) throw new Error("FRONTEND_URL no está configurada");

  return {
    to: user.email,
    subject: "Registro completado",
    html: registerTemplate.replace("{{app_link}}", `${frontendUrl}/#/`),
  };
};

const postCreated = (email, PostData) => {
  const { title, description, category, ubication, image } = PostData;
  const urlPersonalizada = `${process.env.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:5173"}/#/login`;
  // const urlPersonalizada = `http://localhost:5173/#/login`;
  const notificationEmail = postTemplate
  .replace('{{title}}', title)
  .replace('{{description}}', description)
  .replace('{{category}}', category)
  .replace('{{ubication}}', ubication)
  .replace('{{image}}', image[0])
  .replace('{{link}}', urlPersonalizada);
  
  
  return {
    to: email,
    subject: "Publicación Creada",
    html: notificationEmail,
  }
}

const matchMail = (firstUser, secondUser, firstPost, secondPost) => {
  const firstMail = firstUser.email;
  const secondMail = secondUser.email;
  
  const urlPersonalizada = `${process.env.FRONTEND_URL?.replace(/\/+$/, "") || "http://localhost:5173"}/#/exchanges`;
  const currentDateTime = new Date().toLocaleString();

  const notificationEmail = matchTemplate
  .replace('{{currentDateTime}}', currentDateTime)
  .replace('{{user1.username}}', firstUser.username)
  .replace('{{user2.username}}', secondUser.username)
    .replace('{{user1.product}}', firstPost.image[0])
    .replace('{{user2.product}}', secondPost.image[0])
    .replace('{{matchProfileLink}}', urlPersonalizada);

  return {      
      to: firstMail,
      bcc: secondMail,
      subject: "¡Match encontrado!",
      html: notificationEmail,
  }
};

const passwordForgot = (email, resetToken) => {
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");

  if (!frontendUrl) {
    throw new Error("FRONTEND_URL no está configurada");
  }

  const resetUrl = `${frontendUrl}/#/resetpassword?token=${encodeURIComponent(resetToken)}`;
  const forgotTemplateWithLink = forgotTemplate.replace("{{reset_password_link}}", resetUrl);
  
  return {
    to: email,
    subject: "Recuperacion de contraseña",
    html: forgotTemplateWithLink,
  }
}

const accountDeletionMail = (email, deletionToken) => {
  const frontendUrl = process.env.FRONTEND_URL?.replace(/\/+$/, "");
  if (!frontendUrl) throw new Error("FRONTEND_URL no está configurada");
  const deletionUrl = `${frontendUrl}/#/eliminar-cuenta?token=${encodeURIComponent(deletionToken)}`;
  return {
    to: email,
    subject: "Confirmá la eliminación de tu cuenta de Circula",
    html: `<p>Recibimos una solicitud para eliminar tu cuenta de Circula.</p>
      <p>Para continuar, abrí este enlace dentro de los próximos 30 minutos:</p>
      <p><a href="${deletionUrl}">Confirmar eliminación de mi cuenta</a></p>
      <p>Si no hiciste esta solicitud, podés ignorar este correo.</p>`,
  };
};

module.exports = { registerMail, postCreated, matchMail, passwordForgot, accountDeletionMail };
