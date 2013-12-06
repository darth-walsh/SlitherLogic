Getting Started
---------------

_(If this is missing a step, feel free to ask Carl!)_

You'll need some version of Visual Studio:
* Visual Studio Express 2012 for Web 
 * [free download](http://www.microsoft.com/en-us/download/details.aspx?id=30669)
* Visual Studio Professional 2013 
 * [free for students](https://www.dreamspark.com/Product/Product.aspx?productid=72)

You'll also need [TypeScript](http://www.microsoft.com/en-us/download/details.aspx?id=34790).

Once you have these, you should be able to open up the solution and build it!

To run it, you'll have to make a few changes to your IIS Express server:  
1. Open C:\Users\You\Documents\IISExpress\config\applicationhost.config  
2. Add this line after the txt line:
 * `<mimeMap fileExtension=".json" mimeType="text/plain" />`

### Coding guidelines

If there is an issue with the code you are committing in, but the net sum of the change is positive, don't let that stop you! Just add a comment in the code explaining that (e.g. `//TODO#99 Recolor this`) and make sure to make an issue for the problem. I'm going to try avoiding checking in any TODO without an active issue. If it's too much work to file the issue, that means you should probably just fix your code :)

