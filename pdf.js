
var fonts = {
    Roboto: {
        normal: 'fonts/Roboto-Regular.ttf',
        bold: 'fonts/Roboto-Medium.ttf',
        italics: 'fonts/Roboto-Italic.ttf',
        bolditalics: 'fonts/Roboto-MediumItalic.ttf'
    }
};

var PdfPrinter = require('pdfmake');
var printer = new PdfPrinter(fonts);
var fs = require('fs');
var jsonData = JSON.parse(fs.readFileSync("./extra.json", "utf8"));
// Define font files

const format = (number) => {
    let salary = parseFloat(number)
    salary = salary.toFixed(2)
    salary = "" + (salary)
    salary = salary.replace(".", ",")
    return salary
}
function buildTableBody(data) {
    var body = [];

    body.push(['Código', 'Nome', 'Evento', 'Provento', 'Desconto']);
    data.forEach(function (employee) {
        console.log(employee.Employee.roleName);
        var dataRow = [];
        var Row = { 'ul': [] };
        var RowProvento = { 'type': 'none','ul': [] };
        dataRow.push([{ 'text': employee.Employee.registry }, { 'text': '' }, { 'text': 'Cargo' },{ 'text': 'Data de admissão' }]);
        dataRow.push([{ 'text': employee.Employee.name}, { 'text': employee.Employee.roleName },{ 'text': employee.Employee.admissionDate }]);
        employee.Employee.events.forEach(e => {
            Row.ul.push(e.event)
        });
        dataRow.push(Row);
        employee.Employee.events.forEach(e => {
            RowProvento.ul.push(format(e.proceeds));
        });
        dataRow.push(RowProvento);
        dataRow.push(format(employee.Employee.extraSalary));
        
        body.push(dataRow);
        body.push([{ 'text': '' },{ 'text': '' },{ 'text': '' },{ 'text': 'Liquido a receber:' }, { 'text': 'R$'+format(employee.Employee.totalToReceive), 'noWrap': true }]);
        body.push(['', 'Data: __/__/____', { 'text': 'Assinatura: ______________________________'} , '', { 'text': '' }])
        body.push(['', '', '', '', '']);
    });

    return body;
}

function table(data) {
    var content = [];
    var tabela = [];
    var fourE = [];
    var cont = 0;
    data.locations.forEach(function (location) {
        location.Employees.map((e, index) => {
            fourE.push(e);
            cont++;
            if(((index+1) - location.Employees.length) < 4){
                if((index+1) === location.Employees.length){
                    content.push([
                        { text: 'Folha de Pagamentos ' + location.name, style: 'header' },
                        { text: 'JH SERVICOS E CONSTRUCAO LTDA - 22.653.504/0001-43', style: 'subHeader' },
                        { text: 'PERÍODO DE ' + data.startDate + 'até' + data.finalDate, style: 'subHeader' }]);
                    tabela = [{
                        pageBreak: 'after',
                        layout: 'lightHorizontalLines',
                        style: 'table',
                        idths: ['*', 'auto', 'auto', '*', '*'],
                        table: {
                            headerRows: 1,
                            body: buildTableBody(fourE)
                        }
                    }];
                    content.push(tabela);
                    fourE = [];
                    cont = 0;
                }
            }
            // console.log(index);
            // console.log(location.Employees.length+ "tam");
            if(cont === 4){
                content.push([
                    { text: 'Folha de Pagamentos ' + location.name, style: 'header' },
                    { text: 'JH SERVICOS E CONSTRUCAO LTDA - 22.653.504/0001-43', style: 'subHeader' },
                    { text: 'PERÍODO DE ' + data.startDate + ' até ' + data.finalDate, style: 'subHeader' }]);
                tabela = [{
                    pageBreak: 'after',
                    layout: 'lightHorizontalLines',
                    style: 'table',
                    idths: ['*', 'auto', 'auto', '*', '*'],
                    table: {
                        headerRows: 1,
                        body: buildTableBody(fourE)
                    }
                }];
                content.push(tabela);
                fourE = [];
                cont = 0;
            }
        })
    });

    return content; 
}

const pdf = (json) => {
    var docDefinition = {

        footer: function (currentPage, pageCount) { return currentPage.toString() + ' de ' + pageCount; },
    
        content: [
            table(json)
        ],
    
        styles: {
            header: {
                fontSize: 15,
                bold: true,
            },
            subHeader: {
                fontSize: 10,
                bold: false,
            },
            anotherStyle: {
                italics: true,
                alignment: 'right'
            },
            table: {
                fontSize: 10,
            }
        }
    };
    var name = json.name+'.pdf';
    var pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream(name));
    pdfDoc.end();    
    
}
module.exports = pdf;


pdf(jsonData);
