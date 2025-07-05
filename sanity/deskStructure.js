export default (S) =>
  S.list()
    .title('Admin Dashboard')
    .items([
       // NavBar (singleton)
      S.listItem()
        .title('NavBar')
        .id('navbar')
        .child(
          S.editor()
            .id('navbarEditor')
            .schemaType('navbar')
            .documentId('navbar')
        ),
      
<<<<<<< HEAD
    ]);
=======
    ]);
>>>>>>> 946deba6b7d1c1f41c13f12832a065f58e73ac2b
