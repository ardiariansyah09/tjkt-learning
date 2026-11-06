// Bank soal lokal; dapat diperluas guru pada tahap berikutnya.
export const questions = [
{id:'q01',q:'Panjang alamat IPv4 adalah ...',a:['16 bit','32 bit','64 bit','128 bit'],correct:1,why:'IPv4 memiliki 32 bit, dibagi empat oktet.'},
{id:'q02',q:'Nilai desimal biner 11000000 adalah ...',a:['128','160','192','224'],correct:2,why:'128 + 64 = 192.'},
{id:'q03',q:'Subnet mask untuk /26 adalah ...',a:['255.255.255.0','255.255.255.128','255.255.255.192','255.255.255.224'],correct:2,why:'Prefix /26 memiliki 26 bit bernilai 1.'},
{id:'q04',q:'Jumlah alamat pada subnet /27 adalah ...',a:['16','32','64','128'],correct:1,why:'2^(32−27) = 32 alamat.'},
{id:'q05',q:'Host usable pada subnet /28 biasa berjumlah ...',a:['14','16','30','62'],correct:0,why:'16 alamat dikurangi network dan broadcast = 14.'},
{id:'q06',q:'Network dari 192.168.10.70/26 adalah ...',a:['192.168.10.0','192.168.10.64','192.168.10.70','192.168.10.128'],correct:1,why:'Blok /26 berukuran 64 alamat: 0, 64, 128, 192.'},
{id:'q07',q:'Broadcast dari 192.168.10.70/26 adalah ...',a:['192.168.10.63','192.168.10.126','192.168.10.127','192.168.10.255'],correct:2,why:'Blok 64–127 berakhir pada 127.'},
{id:'q08',q:'Prefix terkecil untuk menampung 60 host usable adalah ...',a:['/25','/26','/27','/28'],correct:1,why:'/26 menyediakan 62 host usable.'},
{id:'q09',q:'Tujuan utama VLSM adalah ...',a:['Menghilangkan router','Membuat subnet berukuran sesuai kebutuhan','Menyamakan seluruh prefix','Mengganti alamat MAC'],correct:1,why:'VLSM mengalokasikan subnet berbeda ukuran untuk kebutuhan host berbeda.'},
{id:'q10',q:'Perangkat yang meneruskan paket antar-subnet adalah ...',a:['Switch layer 2 biasa','Hub','Router','Repeater'],correct:2,why:'Router melakukan forwarding paket antarjaringan.'},
{id:'q11',q:'Default gateway PC umumnya adalah ...',a:['Alamat interface router pada LAN PC','Alamat broadcast','Alamat DNS publik saja','Alamat MAC switch'],correct:0,why:'Gateway merupakan next hop menuju jaringan lain.'},
{id:'q12',q:'Jika PC-A /24 dan PC-B /24 berada pada subnet berbeda, komunikasi memerlukan ...',a:['Kabel lebih panjang','Routing antarjaringan','Prefix /32 pada keduanya','IP yang sama'],correct:1,why:'Paket lintas subnet membutuhkan perangkat layer 3.'},
{id:'q13',q:'Network 192.168.10.0/24 termasuk ...',a:['Private IPv4','Loopback','Multicast','Public IPv4'],correct:0,why:'192.168.0.0/16 merupakan rentang private RFC 1918.'},
{id:'q14',q:'Subnet /29 biasa memiliki host usable sebanyak ...',a:['2','4','6','8'],correct:2,why:'/29 mempunyai 8 alamat, 6 host usable.'},
{id:'q15',q:'Apa yang terjadi jika dua subnet VLSM overlap?',a:['Keduanya selalu valid','Alokasi alamat bertabrakan','Prefix otomatis berubah','Router menjadi switch'],correct:1,why:'Alamat yang sama tidak boleh dialokasikan ke dua subnet berbeda dalam rencana ini.'},
{id:'q16',q:'Perintah yang umum dipakai untuk menguji keterjangkauan IP adalah ...',a:['ping','mkdir','copy','rename'],correct:0,why:'Ping menguji respons ICMP jika diizinkan.'},
{id:'q17',q:'IP 192.168.20.20/24 memiliki network address ...',a:['192.168.0.0','192.168.20.0','192.168.20.20','192.168.20.255'],correct:1,why:'Mask /24 mempertahankan tiga oktet pertama.'},
{id:'q18',q:'Pada IPv4 biasa, broadcast untuk 10.0.0.0/30 adalah ...',a:['10.0.0.0','10.0.0.1','10.0.0.2','10.0.0.3'],correct:3,why:'Subnet /30 berisi 4 alamat, broadcast alamat terakhir.'}
];
