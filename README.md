# ISS-technical-test

To open this file, either double click the index.html file or run a live server using python or some server extension.

As it was mentioned that the tester would open the file in the browser, I have made use of the dev_test.dat by including it as a script and adding a const variable to allow its use on the global scope.

This is not how I would have chosen to do this, however due to the risk of this being used locally and not with a server, it was necessary since XMLHttpRequests and AJAX would not allow for accessing of local files.
