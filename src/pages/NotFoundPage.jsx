// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import { Frown } from 'lucide-react'; // Um ícone do Lucide que se encaixa bem
import Logo from "../../public/ClaroText.png"
import NotFound from "../../public/404.jpeg"

function NotFoundPage() {
  return (
    // Este container centraliza a caixa de erro na tela inteira,
    // já que esta página não usa o seu <Layout> principal.
    <div className="flex items-center justify-center min-h-screen bg-none dark:bg-gray-900">
      <div className="container max-w-lg mx-auto p-8 text-center bg-white dark:bg-gray-800">
        {/* <img src={Logo} alt="Logo Claro" className='relative w-14 h-14 left-1/2 -translate-x-1/2 top-3 mb-5' /> */}
        
        <img src={NotFound} className=" mx-auto "  />
        
        {/* <h1 className="mt-6 text-5xl font-extrabold text-gray-900 dark:text-white">
            Oops!
        </h1> */}
        {/* <h2 className="mt-2 text-2xl font-semibold text-gray-700 dark:text-gray-200">
            Página Não Encontrada
        </h2> */}
        {/* <p className="mt-4 text-gray-500 dark:text-gray-400">
            Desculpe, não conseguimos encontrar a página que você está procurando. Ela pode ter sido movida, excluída ou talvez você tenha digitado o endereço errado.
        </p> */}
        
        {/* Usamos <Link> do react-router-dom em vez de <a> 
          e apontamos para /distributions (sua página principal após o login)
        */}
        <Link 
           to="/distributions" 
           className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 mt-8 font-semibold !text-white bg-red-600 rounded shadow-md hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-500 dark:hover:bg-red-600">
            Voltar para o Início
        </Link>
        
      </div>
    </div>
  );
}

export default NotFoundPage;