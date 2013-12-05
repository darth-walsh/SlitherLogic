SlitherLogic
------------

Slitherlink that you can program!

The goal is to create a game that has automated rules to let you focus on the harder parts of Slitherlink.

### Getting started

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
