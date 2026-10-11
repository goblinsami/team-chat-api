export default function Home() {
  return (
    <main>
      <h1>Team Chat</h1>
      <p>Un espacio para conversar con tu equipo.</p>
      <form action="/auth" method="get">
        <button type="submit">Iniciar sesión o registrarse</button>
      </form>
    </main>
  );
}
