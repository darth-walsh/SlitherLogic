Getting Started
---------------

### Setup

_(If this is missing a step, feel free to ask Carl!)_

#### Visual Studio

Visual Studio is your one-stop-shop Integrated Development Environment. You could probably even use it's web browser to play the game!

You'll need some version of Visual Studio:
* Visual Studio Express 2013 for Web 
 * [free download](http://www.microsoft.com/en-us/download/details.aspx?id=40747)
* Visual Studio Professional 2013
 * [free for students](https://www.dreamspark.com/Product/Product.aspx?productid=72)

~~You could also get Visual Studio 2013, which is being released in December. The same links have something of the sort.~~ Just get the 2013 version of Visual Studio, and don't bother with 2012. Web Essentials doesn't play nice with VS2012.

You're probably only going to want one Git client on you computer. You can use the GitHub client, or you can use the Visual Studio client. If something is going wrong with one of them, make sure the other one is completely turned off. (Visual Studio 2013 will start up Git by itself, I've found.)

Once you download the project, you'll want to verify SlitherLogic -> Properties -> Web -> Start Action is set to `game.html`. It should already be set, but this is nice to have.

I've found when running the game, it takes a long time to build when you run debug, and a long time to start in the browser after that. Normally I start without debugging. (I don't believe debugging would do anything, as there isn't any code running on the server. It's all in your browser!)
 
#### TypeScript 

TypeScript is a new language from Microsoft that is essentially a typed version of JavaScript. It lets you define classes and interfaces, and has various forms of syntactic sugar (for instance, the `=>` lambda operator). Often when you have a question for how to do something (e.g. regular expressions) you should google JavaScript not TypeScript. Visual Studio gives a nice developing experience with Intellisense and type checking. 

[Download](http://www.microsoft.com/en-us/download/details.aspx?id=34790) TypeScript to get started!

Once you have these, you should be able to open up the solution and build it!

#### IIS Express

Once you've gotten all that, when you go to run the project your browser will get pointed to a IISExpress server running on your computer serving the game.

You'll probably get a Forbidden Error, because the server is not set up to serve JSON:
1. Open C:\Users\You\Documents\IISExpress\config\applicationhost.config  
2. Add this line after the txt line:
 * `<mimeMap fileExtension=".json" mimeType="text/plain" />`

You probably also want to enable directory browsing, so it is easy to poke around file structure. I think I followed [these instructions](http://stackoverflow.com/questions/8543761/how-to-enable-directory-browsing-by-default-on-iis-express).
 
### Coding guidelines

Code will often be read many more times than it is written. Keep that in mind and try to make what you write clear. If it's hard to understand, it probably needs a comment (or some refactoring).

#### Commits

Commit often and commit early!

I recommend you use the [commit message feature](https://help.github.com/articles/closing-issues-via-commit-messages) where you simply include the text `fixes #99` in your commit message and it will resolve the issue. If you use multiple commits to fix an issue, that's great! But try to keep each issue to a separate commit unless they're fixing the same thing :)

Since everything is tracked with version control, please feel free to delete dead code (unused functions, commented out code, etc.). Just make it a separate commit!

#### Tracking issues

If there is an issue with the code you are committing in, but the net sum of the change is positive, don't let that stop you! Just add a comment in the code explaining that (e.g. `//TODO#99 Recolor this`) and make sure to make an issue for the problem. I'm going to try avoiding checking in any TODO without an active issue. If it's too much work to file the issue, that means you should probably just fix your code :)

#### Testing

I don't have any rigid plans on testing (so far just making things work is plenty of work!). If something breaks, we can always fix it! Whatever you want pulled should build, along with a short description of why it is better. That could be a before/after screenshot, or some situation that your code handles better.

My plan right now for programming rules is to give the user a web test GUI where they can run scenarios, and that would also be a good place to test the automatic logic?
