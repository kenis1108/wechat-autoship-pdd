import SQLiteDB from '../models';
import { priceTable, priceTableRow } from '../models/tables/price';

const data: priceTableRow[] = [
  {
    productName: 'A款链条',
    unit: '条',
    size: '100cm',
    sizePrice: '12',
    remarks: '每叠加10cm贵2元'
  },
  {
    productName: 'C款链条',
    unit: '条',
    size: '100cm',
    sizePrice: '14',
    remarks: '每叠加10cm贵2元'
  },
  {
    productName: '锁扣小号',
    unit: '个',
    size: '',
    sizePrice: '12',
    remarks: ''
  },
  {
    productName: '锁扣大号',
    unit: '个',
    size: '',
    sizePrice: '14',
    remarks: ''
  },
  {
    productName: '锁扣加大号',
    unit: '个',
    size: '',
    sizePrice: '16',
    remarks: ''
  },
  {
    productName: '底座单买',
    unit: '个',
    size: '',
    sizePrice: '9',
    remarks: ''
  },
  {
    productName: '5cm底座单买',
    unit: '个',
    size: '5cm',
    sizePrice: '11',
    remarks: ''
  },
  {
    productName: '穿皮锁',
    unit: '个',
    size: '4cm',
    sizePrice: '16',
    remarks: ''
  },
  {
    productName: '穿皮锁',
    unit: '个',
    size: '5cm',
    sizePrice: '22',
    remarks: ''
  },
]
const db = new SQLiteDB('autoship.db');
db.init()
for (let index = 0; index < data.length; index++) {
  const element = data[index];
  db.insertOne<priceTableRow>(priceTable, element)
}

db.close();