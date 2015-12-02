function addNewContact() {
  var name = $('#new-contact-name').val();
  var email = $('#new-contact-email').val();

  if (!name || !email) {
    alert('Please fill in all fields');
    return;
  }

  addContact({
    name: name,
    email: email
  }, refreshContactsList);
}

function refreshContactsList() {
  $('.search-results').remove();

  var displayList = function (data) {
    var dataObj = $.parseJSON(data);

    $.each(dataObj.contacts, function (key, val) {
      var line = $('<tr>').attr('class', 'search-results');
      var id = $('<td>').text(val.id);
      $(id).on('click', function () {
        location.href = '/contacts/' + val.id;
      });

      line.append(id);
      line.append($('<td>').text(val.name));
      line.append($('<td class=\'email\'>').text(val.email));
      var delButton = $('<button value=\'delete\'>').on('click', function () {
        if (confirm('Are you sure you want to delete the contact ' + val.id + '?')) {
          deleteContact(val.id, refreshContactsList);
          return;
        }
      }).attr('id', val.id).text('Delete');

      $('.result').append(line);
      line.append($('<td>').append(delButton));
    });
  };

  getContacts(displayList);
}

function refreshContact(contactID) {
  var displayContact = function (data) {
    $('.search-results').remove();

    var dataObj = $.parseJSON(data);
    var line = $('<tr>').attr('class', 'search-results');
    line.append($('<td>').text(dataObj.contact.id));
    line.append($('<td>').text(dataObj.contact.name));
    line.append($('<td class=\'email\'>').text(dataObj.contact.email));
    $('.result').append(line);
    $('#contact-name').val(dataObj.contact.name);
    $('#contact-email').val(dataObj.contact.email);
  };

  getContact(contactID, displayContact);
}
