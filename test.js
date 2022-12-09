const page = '2';
const currentPage = (typeof(Number(page)) == 'number') ? page : 1;
console.log(Number(page) > 0);