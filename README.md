# Thor's LIttle Shoppe of Lightning Exercises

This is a simple interface for executing individual JavaScript functions. Each function is intended to be a simple, stand-alone, "lightning exercise" completed by a student while learning the basics of programming in JavaScript.

## How do I use it?

1. Get the repo on your computer
   For example
   ```sh
   git clone git@github.com:askingalot/thor.git
   git remote rm origin
   git remote add origin <your remote repo>
   ```
1. Use a webserver to serve the application. 
   For example, using the [serve](https://www.npmjs.com/package/serve) webserver

    ```sh
    cd thor
    serve .
    ```
1. Open the application in your web browser
   If you used `serve` the default url is
   http://localhost:5000/
1. Open the `thor` directory in your editor of choice
   For example, using [Visual Studio Code](https://code.visualstudio.com/)
   ```sh
   code .
   ```

1. Add the appropriate code to the functions in the `functions.js` file to complete each exercise.
1. To test your work after you've changed a function: 

   1. Refresh the browser
   1. Select the function name
   1. Fill in any needed arguments
   1. Click the `Execute` button.
   1. Confirm the result in the _result_ panel

Once you've completed the existing exercises feel free to add your own. Any function you add in the `functions.js` file will appear in the _Available Functions_ panel.
