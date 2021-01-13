# Bottle - A place to keep your lightning

This is a simple interface for executing individual JavaScript functions. Each function is intended to be a simple, stand-alone, "lightning exercise" completed by a student while learning the basics of programming in JavaScript.

## How do I use it?

1. Install Node.js version 14 or greater

1. Get the repo on your computer
   For example
   ```sh
   git clone git@github.com:askingalot/bottle.git
   git remote rm origin
   git remote add origin <your remote repo>
   ```
1. Start the server

    ```sh
    cd bottle
    npm start
    ```

2. Open the application in your web browser. http://localhost:3001

3. Open the `bottle` directory in your editor of choice
   For example, using [Visual Studio Code](https://code.visualstudio.com/)
   ```sh
   code .
   ```

4. Add the appropriate code to the functions in the JavaScript modules found in the `exercises` directory.

5. To test your work after you've changed a function: 

   1. Refresh the browser
   2. Select the module name from the module dropdown
   3. Select the function name
   4. Fill in any needed arguments
   5. Click the `Execute` button.
   6. Confirm the result in the _result_ panel. If there is a test associated with the function `bottle` will execute it and indicate whether your function passed or failed the test.

Once you've completed the existing exercises feel free to add your own. Any module you add in the `exercises` directory will appear in the _Available Modules_ dropdown after you refresh the browser.
