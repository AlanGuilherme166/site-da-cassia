// auth-guard.js

/**
 * Verifica se há um usuário autenticado com Firebase.
 * Se não estiver autenticado, redireciona para a tela de login.
 * Se estiver autenticado, busca o perfil no Firestore e valida o tipo de usuário.
 * Se o perfil não for encontrado, redireciona para atualização.
 */

document.addEventListener("DOMContentLoaded", () => {
  firebase.auth().onAuthStateChanged(user => {
    if (!user) {
      // Usuário não autenticado → redirecionar
      const loginUrl = `${location.origin}/projetoGamificaEduk/html/login/login.html`;
      console.warn("Acesso negado: sessão inexistente. Redirecionando para login...");
      window.location.href = loginUrl;
      return;
    }

    // Verifica o perfil no Firestore com base no UID
    userService.findByUid(user.uid)
      .then(userData => {
        console.log("Sessão validada. Usuário autenticado:", userData.uid || user.uid);
        // Aqui você pode aplicar lógica adicional baseada em perfil, se necessário
      })
      .catch(error => {
        // Se o erro for perfil não encontrado
        if (error.message === "01 - Não encontrado.") {
          const profileUpdateUrl = `${location.origin}/projetoGamificaEduk/html/profile/update-profile.html`;
          alert("Seu perfil precisa ser atualizado e ativado! Acesse o menu perfil.");
          window.location.href = profileUpdateUrl;
        } else {
          console.error("Erro ao buscar perfil:", error);
        }
      });
  });
});

