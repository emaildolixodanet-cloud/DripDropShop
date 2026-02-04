// products.js - Catálogo de Produtos
const products = [
  {
    id: "ralph-lauren-hoodie",
    type: "Hoodie",
    name: "Hoodie Ralph Lauren",
    price: "35,00 €",
    description: "Artigo novo com etiqueta.",
    available: true,
    whatsappText: "Olá, estou interessado no Hoodie Ralph Lauren.",
    colors: [
      {
            "name": "azul",
            "images": [
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-azul/ralph-lauren-hoodie-azul-01.jpg",
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-azul/ralph-lauren-hoodie-azul-02.jpg",
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-azul/ralph-lauren-hoodie-azul-03.jpg"
            ]
      },
      {
            "name": "branca",
            "images": [
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-branca/ralph-lauren-hoodie-branca-01.jpg",
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-branca/ralph-lauren-hoodie-branca-02.jpg",
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-branca/ralph-lauren-hoodie-branca-03.jpg",
                  "img/produtos/ralph-lauren-hoodie/ralph-lauren-hoodie-branca/ralph-lauren-hoodie-branca-04.jpg"
            ]
      }
]
  },

  {
    id: "hoodie-carhartt",
    type: "Hoodie",
    name: "Hoodie Carhartt",
    price: "35,00 €",
    description: "Artigo novo com etiqueta.",
    available: true,
    whatsappText: "Olá, estou interessado no Hoodie Ralph Lauren.",
    image: ["img/produtos/hoodie-carhartt/hoodie-carhartt-castanha/hoodie-carhartt-castanha-01.jpg","img/produtos/hoodie-carhartt/hoodie-carhartt-castanha/hoodie-carhartt-castanha-02.jpg","img/produtos/hoodie-carhartt/hoodie-carhartt-castanha/hoodie-carhartt-castanha-03.jpg","img/produtos/hoodie-carhartt/hoodie-carhartt-castanha/hoodie-carhartt-castanha-04.jpg","img/produtos/hoodie-carhartt/hoodie-carhartt-castanha/hoodie-carhartt-castanha-05.jpg"]
  },
];

window.products = products;
