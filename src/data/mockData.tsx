
import { 
  GraduationCap, Award, Trophy, Flag, Star, 
  Zap, BookOpen, Target, Heart, CheckCircle 
} from "lucide-react";

export const mockAchievements = [
  {
    id: "a1",
    title: "Excelencia Académica",
    description: "Calificación sobresaliente en examen trimestral",
    icon: <GraduationCap className="text-blue-500" />,
    coins: 50,
    date: "2023-04-05",
    category: "academic"
  },
  {
    id: "a2",
    title: "Estudiante Ejemplar",
    description: "Reconocido por compañerismo y valores positivos",
    icon: <Star className="text-yellow-500" />,
    coins: 30,
    date: "2023-04-10",
    category: "behavior"
  },
  {
    id: "a3",
    title: "Deportista Destacado",
    description: "Desempeño excepcional en competencias deportivas",
    icon: <Trophy className="text-amber-500" />,
    coins: 40,
    date: "2023-04-12",
    category: "sports"
  },
  {
    id: "a4",
    title: "Proyecto Innovador",
    description: "Presentación sobresaliente en la feria de ciencias",
    icon: <Zap className="text-indigo-500" />,
    coins: 45,
    date: "2023-04-18",
    category: "academic"
  },
  {
    id: "a5",
    title: "Servicio Comunitario",
    description: "Participación sobresaliente en actividades de voluntariado",
    icon: <Heart className="text-pink-500" />,
    coins: 35,
    date: "2023-04-20",
    category: "community"
  }
];

export const mockTransactions = [
  {
    id: "t1",
    type: "earning",
    description: "Excelencia Académica",
    amount: 50,
    date: "2023-04-05",
    category: "achievement"
  },
  {
    id: "t2",
    type: "spending",
    description: "Cupón para la tienda escolar",
    amount: 20,
    date: "2023-04-08",
    category: "marketplace"
  },
  {
    id: "t3",
    type: "earning",
    description: "Estudiante Ejemplar",
    amount: 30,
    date: "2023-04-10",
    category: "achievement"
  },
  {
    id: "t4",
    type: "transfer",
    description: "Transferencia a Carlos M.",
    amount: 15,
    date: "2023-04-15",
    category: "exchange"
  },
  {
    id: "t5",
    type: "earning",
    description: "Deportista Destacado",
    amount: 40,
    date: "2023-04-12",
    category: "achievement"
  },
  {
    id: "t6",
    type: "earning",
    description: "Proyecto Innovador",
    amount: 45,
    date: "2023-04-18",
    category: "achievement"
  },
  {
    id: "t7",
    type: "spending",
    description: "Entrada para evento escolar",
    amount: 25,
    date: "2023-04-19",
    category: "marketplace"
  },
  {
    id: "t8",
    type: "earning",
    description: "Servicio Comunitario",
    amount: 35,
    date: "2023-04-20",
    category: "achievement"
  }
];

export const mockMarketplaceItems = [
  {
    id: "m1",
    title: "Cupón Tienda Escolar",
    description: "Canjeable por productos en la tienda de la escuela",
    image: "/marketplace-coupon.jpg",
    price: 20,
    stock: 10,
    category: "coupons"
  },
  {
    id: "m2",
    title: "Entrada Evento Escolar",
    description: "Acceso a concierto, obra de teatro o evento deportivo",
    image: "/marketplace-ticket.jpg",
    price: 25,
    stock: 15,
    category: "events"
  },
  {
    id: "m3",
    title: "Día sin Uniforme",
    description: "Permiso para asistir un día sin el uniforme escolar",
    image: "/marketplace-clothes.jpg", 
    price: 30,
    stock: 5,
    category: "privileges"
  },
  {
    id: "m4",
    title: "Tiempo en Sala de Juegos",
    description: "30 minutos en la sala de juegos durante un recreo",
    image: "/marketplace-games.jpg",
    price: 15,
    stock: 8,
    category: "privileges"
  },
  {
    id: "m5",
    title: "Certificado de Reconocimiento",
    description: "Certificado oficial firmado por el director",
    image: "/marketplace-certificate.jpg",
    price: 40,
    stock: 20,
    category: "certificates"
  },
  {
    id: "m6",
    title: "Almuerzo Especial",
    description: "Menú especial en la cafetería escolar",
    image: "/marketplace-lunch.jpg",
    price: 35,
    stock: 12,
    category: "food"
  }
];

export const mockExchangeListings = [
  {
    id: "e1",
    studentId: "s2",
    studentName: "Carlos Mendoza",
    title: "Ayuda con matemáticas",
    description: "Ofrezco ayuda con problemas de álgebra",
    price: 15,
    date: "2023-04-14"
  },
  {
    id: "e2",
    studentId: "s3",
    studentName: "Laura Betancourt",
    title: "Clases de guitarra",
    description: "Lecciones básicas de guitarra por 20 minutos",
    price: 20,
    date: "2023-04-16"
  },
  {
    id: "e3",
    studentId: "s4",
    studentName: "Diego Fuentes",
    title: "Asesoría informática",
    description: "Ayuda con aplicaciones, configuraciones y más",
    price: 25,
    date: "2023-04-17"
  }
];

// For admin statistics
export const mockSchoolStats = {
  totalStudents: 450,
  totalTeachers: 28,
  totalTransactions: 1245,
  totalCoinsInCirculation: 32500,
  mostPopularItems: [
    { name: "Cupón Tienda Escolar", count: 42 },
    { name: "Día sin Uniforme", count: 38 },
    { name: "Entrada Evento Escolar", count: 35 }
  ],
  topAchievers: [
    { name: "María López", coins: 280 },
    { name: "Javier Ruiz", coins: 245 },
    { name: "Daniela Torres", coins: 230 }
  ],
  recentActivity: [
    { description: "20 estudiantes recibieron monedas por logros académicos", date: "2023-04-22" },
    { description: "Nuevo producto agregado al Mercado Escolar: Taller de Robotica", date: "2023-04-21" },
    { description: "Actualización de precios en artículos del Mercado", date: "2023-04-20" }
  ]
};
