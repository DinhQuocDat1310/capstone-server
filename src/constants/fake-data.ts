import { PositionWrap } from '@prisma/client';

export const FAKE_LOGO = [
  'https://th.bing.com/th/id/OIP._ATdCQVSmjrY1dVNpWAQWAHaE8?w=265&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.qN6KiQUpI_W_MdQouy_HuQHaHX?w=178&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.TTJRCrVSsuNSxqRNYT-FvwHaHa?w=177&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.7SwsOulgYxbXc0bNA3QuyQHaEC?w=326&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.s6RuZ2Cv4DtF-HuEFALqKwHaHa?w=177&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.sxdELx88HQjlvgfXWUENawHaHa?w=170&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.MEk8RNMMUnBthGFVnguw4QHaEJ?w=303&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.kIMyGsCSJD9ZRExrLCIMwgHaEZ?w=287&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.tqbM7CUqfa_AzNFT72bDLAHaFQ?w=240&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.3GM9bGKXlJ_NWnB93oTbmwHaEK?w=304&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.oim9cuLLhgix0B8FO0BZFgHaCX?w=349&h=112&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.h1xP5_x_qeYrpRmXiBVhBAHaEK?w=321&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.vdZ18U-OFCYdBRZ5rELDLgHaEE?w=328&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.iv2qskqD1LgIXPPsirM3SQHaDp?w=304&h=172&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.n2R_vXPsO7Djgs9lDdrcxAHaEm?w=252&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.NQT_duxW9J7vMZ6zRDG6CAHaH6?w=158&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.t4pl2yghIHuhScDlKatUlQHaFe?w=226&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.yhkDb-o64r28LfrKTU99rQHaDB?w=318&h=142&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.hFowJ4K22OfqffLnMvenxwHaEK?w=268&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIF.nAUsyh6OCi9YUIPdTPtNOw?w=170&h=180&c=7&r=0&o=5&pid=1.7',
];

export const FAKE_LICENSE = [
  'https://th.bing.com/th/id/OIP.EoyYy_VgTIylDBk7AHncWwHaFt?w=222&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.cr5INGCcZtSkQATzgx0LGgHaDR?w=332&h=154&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.DT_zcgZKoolDENA2CgPqzAHaDG?w=333&h=146&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.g1uS5RlwymQpOb_Xnh8V7wHaFu?w=219&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.p3_83_draxqyHV8uF_7pDQHaFt?w=178&h=147&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.RScvLxcfEBy0fENnBmsc7QHaKb?w=135&h=184&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.NdFYDTeVII7xA62X7lVa7wHaHE?w=196&h=184&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th?q=New+York+Business+License&w=120&h=120&c=1&rs=1&qlt=90&cb=1&pid=InlineBlock&mkt=en-WW&cc=VN&setlang=en&adlt=moderate&t=1&mw=247',
  'https://th.bing.com/th/id/OIP.iWYKkYA1Z9ZuQsPX3tVBrgHaDN?w=334&h=151&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.pNMmBV4zLpYtzR78QMeKEQAAAA?w=260&h=116&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.zPMMhCgW8DT93Gxb8lWIbwHaMM?w=119&h=184&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th?q=Alabama+Business+License&w=120&h=120&c=1&rs=1&qlt=90&cb=1&pid=InlineBlock&mkt=en-WW&cc=VN&setlang=en&adlt=moderate&t=1&mw=247',
  'https://th.bing.com/th/id/OIP.h0UUkTWoRbuYASm8W1BaPAHaFu?w=258&h=199&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.IfRIbELYP29aaThrX_SfewHaK0?w=136&h=199&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.a0XMdwe_rAmXv_Lc87dp5gHaFP?w=282&h=199&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.Z04i1Rj8AtDTzZcrRBdUqQHaF7?w=239&h=191&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th?q=Business+License+of+Irish+Company&w=120&h=120&c=1&rs=1&qlt=90&cb=1&pid=InlineBlock&mkt=en-WW&cc=VN&setlang=en&adlt=moderate&t=1&mw=247',
  'https://th.bing.com/th/id/OIP.RLH_v-cXhf7CkzwueY0lJQHaJl?w=127&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.vk2sFqd4Wqw03354mu64eQHaKM?w=120&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.EoyYy_VgTIylDBk7AHncWwHaFt?w=258&h=199&c=7&r=0&o=5&pid=1.7',
];

export const FAKE_FRONT_CARDLICENSE = [
  'https://th.bing.com/th/id/OIP.fhiyPIQ0xRA7neiuOavMWwHaEK?w=333&h=187&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.eD29jbCVRc4Bt0cI8m3GBAHaEq?w=298&h=187&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.uPo4zto0PWWIdqcWJEn-uQHaEs?w=296&h=187&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.fpJUyua_UiPAKDUasAfgygHaEq?w=298&h=187&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.wgstndBTDqmDyZ9ItnrmeAHaEs?w=254&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP._zidDAdDENZeZO3tBcOBTwHaFL?pid=ImgDet&rs=1',
  'https://th.bing.com/th/id/OIP.ul-D7-Hpq4mgVc-oV4PxSgHaEq?w=251&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.vVMioLgb_MO7vMFTCdqusgHaEr?w=250&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.S_T9IY1He2jWjBbdSzllKgHaEK?w=319&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th?id=OIF.%2b78vAt0jLFbvd06Y9kYmYQ&w=270&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.KyCjzpIzxudISf9E5qvN-AHaE4?w=272&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.C6slNkjSFWzBSgECaLhbogHaHa?w=179&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.YWjshZoIaHd8R1P2yORgBAHaEo?w=282&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.5XyLFyXSuca8clXs8LyUGAHaEd?w=285&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.nb5qWf-kaBX140aEqtCQWAHaE2?w=274&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP._zidDAdDENZeZO3tBcOBTwHaFL?w=224&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th?id=OIF.fycGu6zkhQL7VvTLut%2fWlw&w=179&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th?id=OIF.RTBdLXr7L%2fhKMV4bTkmaTg&w=229&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.doEQFpErzWeWs2bFVmXE5AAAAA?w=221&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.idIxbxLnV2pc__Z3FxeLNAHaHa?w=164&h=180&c=7&r=0&o=5&pid=1.7',
];

export const FAKE_BACK_CARDLICENSE = [
  'https://th.bing.com/th/id/OIP.-4xIGuNQosty9G_yOPhTZAHaD4?w=292&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.m6jgJHSiiT-CEkBhjPenhQHaE8?w=239&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.ToWer2VUO7Mjh74mhezEYQHaDt?w=296&h=175&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.sxyvJX19aY0xU9c-vv3diwHaE8?w=239&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.TtZIU6o5YCnXKWe6Gj23jAHaEq?w=169&h=126&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.-NUj-7IR80DWhgZ9szv73AEsC0?w=271&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.d5GtpAIdFIN9RmIKz5XX0QHaE9?w=286&h=191&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.ZVxAiAmv-h93NbNDva9CNwAAAA?w=220&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.Q2s1d17oiGfxEnbXoLRdOwHaDt?w=297&h=175&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.8ZMj9lZJKAvlwAeksWMH3QAAAA?w=214&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.mHR1zzJf2uLwObq3KGnsUAHaFb?w=236&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.pzVF6Er4leGf-zZqttdioAHaFj?w=230&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.oVAxFRoAp_FKsxvhhELtawHaFH?w=228&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.sK696v41cy5KMyCOYZG-HgHaFj?w=231&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.l_ll5c3VuVgQu6nfhS5TJwHaFo?w=227&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.CkhYO4w47pknS8QKGUGJ9AHaEp?w=298&h=186&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.0aV9muwivo1ftEl-ay35lgHaFj?w=226&h=180&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.aZ5HqRTssgYcGTBlWMwosgHaFG?w=284&h=195&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/OIP.gWoj4VG3YhSuraFBNNxgzgHaE8?w=292&h=195&c=7&r=0&o=5&pid=1.7',
  'https://th.bing.com/th/id/R.a9ec2c2c70ae0de42399c061cb89a1de?rik=7X5BejgdP6mKyA&pid=ImgRaw&r=0',
];

export const FAKE_TYPE_BUSINESS = [
  'Eating',
  'Science',
  'Clothing',
  'Electric',
  'Medicine',
  'Fixing',
  'Event',
  'Banking',
  'Housing',
  'Eating',
  'Science',
  'Clothing',
  'Electric',
  'Medicine',
  'Fixing',
  'Event',
  'Banking',
  'Housing',
  'Eating',
  'Other',
];

export const FAKE_ADDRESS = ['Hà Nội', 'TP Hồ Chí Minh'];

export const FAKE_ADDRESS_POINT = [
  '9 P. Trịnh Hoài Đức, Cát Linh, Đống Đa, Hà Nội, Vietnam',
  '37 Đ. Vạn Tượng, Phường 13, Quận 5, Thành phoos Hồ Chí Minh, Vietnam',
];

export const FAKE_ADDRESS_ACCOUNT = ['TP Hồ Chí Minh', 'Hà Nội'];

export const FAKE_PRICE_PER_KM = ['15000', '15000'];

export const FAKE_OWNER_BUSINESS = [
  'Nguyen Van A',
  'Nguyen Van B',
  'Nguyen Van C',
  'Nguyen Van D',
  'Nguyen Van E',
  'Nguyen Van F',
  'Nguyen Van G',
  'Nguyen Van H',
  'Nguyen Van I',
  'Nguyen Van J',
  'Nguyen Van K',
  'Nguyen Van L',
  'Nguyen Van M',
  'Nguyen Van N',
  'Nguyen Van O',
  'Nguyen Van P',
  'Nguyen Van Q',
  'Nguyen Van R',
  'Nguyen Van S',
  'Nguyen Van T',
];

export const FAKE_IMAGE_CAR = [
  'https://images.unsplash.com/photo-1578643800244-b45ab16b5038?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MXx8YmFjayUyMGNhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1578002315382-5c0c8dfff051?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8YmFjayUyMGNhcnxlbnwwfHwwfHw%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1611760394284-e2c6b98141cc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTJ8fGJhY2slMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1566591457035-6c21b3eac564?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mjh8fGJhY2slMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1599388050944-ab3cc1c76883?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8Mzd8fGJhY2slMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1560402974-01f2b0209512?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NDl8fGJhY2slMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1641154141199-35cb91390a88?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8ODN8fGJhY2slMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1657197576778-1b14b6c2834a?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=627&q=80',
  'https://images.unsplash.com/photo-1657197583255-f6ef13f848f9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDN8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1657197583201-940ca31cd693?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDh8fHxlbnwwfHx8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1583356322882-85559b472f56?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NHx8ZnJvbnQlMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1580741673185-c3f3eec9c01e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDExfHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1603189549723-29a00cd56120?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1yZWxhdGVkfDE5fHx8ZW58MHx8fHw%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1503507420689-7b961cc77da5?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8OHx8ZnJvbnQlMjBjYXJ8ZW58MHx8MHx8&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1530620525414-8c3694c79777?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MTd8fGZyb250JTIwY2FyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1584143728973-3d0d38be5795?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8MjV8fGZyb250JTIwY2FyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1611317545869-9fc2d6b36be9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTF8fGZyb250JTIwY2FyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1605034647645-441fa7574438?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NTl8fGZyb250JTIwY2FyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1661030607158-a6273acfad5b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NzN8fGZyb250JTIwY2FyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1615836494670-706aa6af4974?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NzB8fGZyb250JTIwY2FyfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60',
];

export const FAKE_DURATION = [30, 60, 90, 2, 1];

export const FAKE_TOTALKM = ['27000', '36000', '42000', '48000', '54000'];

export const FAKE_QUANTITY_DRIVER = [45, 30, 35, 80, 45];

export const FAKE_CAMPAIGN_NAME = [
  'Campaign A',
  'Campaign B',
  'Campaign C',
  'Campaign D',
  'Campaign E',
];

export const FAKE_POSITION_WRAP = [
  PositionWrap.LEFT_SIDE,
  PositionWrap.BOTH_SIDE,
  PositionWrap.RIGHT_SIDE,
  PositionWrap.LEFT_SIDE,
  PositionWrap.BOTH_SIDE,
];

export const POSITION_WRAP = [
  PositionWrap.LEFT_SIDE,
  PositionWrap.BOTH_SIDE,
  PositionWrap.RIGHT_SIDE,
];

export const PRICE_POSITION_WRAP = [300000, 600000, 300000];

export const FAKE_PRICE_POSITION_WRAP = [
  300000, 600000, 300000, 300000, 600000,
];
