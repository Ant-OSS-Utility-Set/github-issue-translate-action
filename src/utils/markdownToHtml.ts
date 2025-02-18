

export  function replaceMarkdownSyntax(input:string):string {
  // 正则表达式匹配Markdown语法标识符
  const markdownSyntaxRegex = /(\*|_|\`|>|#|\[|\])+/g;
  // 替换函数，将匹配到的Markdown语法标识符替换为HTML的对应标签

  const handlePairs = (match:string) => {
    const openingTag = match[1];
    const closingTag = openingTag === '*' ? '</em>' : openingTag === '_' ? '</strong>' : '</code>';
    return `<${openingTag}>${match.substring(2, match.length - 2)}</${closingTag}>`;
  };

  const replaceFunction = (match:string, p1:string) => {

    // 根据匹配到的字符类型，生成对应的HTML标签
    switch (p1) {
      case '*':
        return '<em>';
      case '_':
        return '<strong>';
      case '`':
        return '<code>';
      case '>':
        return '<blockquote>';
      case '#':
        return '<h1>';
      case '[':
        return '<a href="">';
      case ']':
        return '</a>';
      default:
        // // 如果匹配到的字符是成对标识的开始，处理成对标识
        if (p1 === '*' || p1 === '_' || p1 === '`') {
          return handlePairs(match);
        }
        return '';
    }
  };
  // 使用replace方法进行替换
  return input.replace(markdownSyntaxRegex, replaceFunction);
}
//
// // 测试函数
// const mainTsContent = `
// # Title
//
// This is a sample Markdown text with various elements:
//
// ## Subheading
//
// You can use **bold** text, *italic* text, and even [links](https://www.example.com).
//
// ### List
//
// - Item 1
// - Item 2
// - Item 3
//
// > This is a blockquote.
//
// You can also include code snippets:
//
// \`\`\`javascript
// console.log("Hello, World!");
// \`\`\`
//
// Enjoy writing Markdown!
// `;
//
// console.log(replaceMarkdownSyntax(mainTsContent));
