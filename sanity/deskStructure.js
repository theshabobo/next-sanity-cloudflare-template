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
      
    ]);
