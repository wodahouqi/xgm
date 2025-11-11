import type { Artwork, Artist, Category } from '@/types'

export const mockArtworks: Artwork[] = [
  {
    id: '1',
    title: '山水意境',
    artistId: 'artist1',
    artistName: '李明华',
    category: '国画',
    price: 15000,
    year: 2023,
    dimensions: { width: 80, height: 60 },
    material: '宣纸、水墨',
    description: '这幅山水画展现了中国传统绘画的深厚底蕴，通过墨色的浓淡变化，表现出山水的层次感和意境美。',
    images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20landscape%20painting%20with%20mountains%2C%20rivers%2C%20and%20misty%20atmosphere%2C%20ink%20wash%20style%2C%20elegant%20and%20serene&image_size=landscape_4_3'],
    status: 'available',
    createdAt: '2023-10-15T08:00:00Z',
    updatedAt: '2023-10-15T08:00:00Z'
  },
  {
    id: '2',
    title: '现代抽象',
    artistId: 'artist2',
    artistName: '王晓雨',
    category: '油画',
    price: 28000,
    year: 2024,
    dimensions: { width: 100, height: 80 },
    material: '油画布、丙烯',
    description: '现代抽象艺术作品，运用鲜明的色彩对比和几何形状，表达当代都市生活的节奏感。',
    images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20abstract%20painting%20with%20geometric%20shapes%2C%20bold%20colors%2C%20contemporary%20art%20style%2C%20dynamic%20composition&image_size=square'],
    status: 'available',
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '3',
    title: '静物花卉',
    artistId: 'artist3',
    artistName: '张美玲',
    category: '水彩',
    price: 8500,
    year: 2023,
    dimensions: { width: 40, height: 50 },
    material: '水彩纸、水彩颜料',
    description: '精美的水彩花卉作品，色彩清新淡雅，展现了大自然的生机与美丽。',
    images: ['https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Watercolor%20painting%20of%20beautiful%20flowers%2C%20delicate%20colors%2C%20soft%20brushstrokes%2C%20botanical%20art%20style&image_size=portrait_4_3'],
    status: 'reserved',
    createdAt: '2023-08-12T14:15:00Z',
    updatedAt: '2023-08-12T14:15:00Z'
  }
]

export const mockArtists: Artist[] = [
  {
    id: 'artist1',
    name: '李明华',
    bio: '著名国画家，从事传统山水画创作30余年，作品多次获得国家级奖项，擅长表现山水意境。',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Professional%20Chinese%20artist%20portrait%2C%20wise%20and%20artistic%20appearance%2C%20traditional%20clothing%2C%20painting%20studio%20background&image_size=square',
    email: 'liminghua@art.com',
    phone: '13800138000',
    website: 'www.liminghua.art',
    artworks: ['1'],
    verified: true,
    createdAt: '2020-01-01T00:00:00Z'
  },
  {
    id: 'artist2',
    name: '王晓雨',
    bio: '现代抽象艺术家，毕业于中央美术学院，专注于当代抽象艺术创作，作品风格独特。',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20artist%20portrait%2C%20contemporary%20style%2C%20creative%20atmosphere%2C%20art%20studio%20background&image_size=square',
    email: 'wangxiaoyu@art.com',
    phone: '13900139000',
    artworks: ['2'],
    verified: true,
    createdAt: '2019-06-15T00:00:00Z'
  },
  {
    id: 'artist3',
    name: '张美玲',
    bio: '水彩画艺术家，擅长花卉和静物绘画，作品风格清新自然，深受收藏者喜爱。',
    avatar: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Elegant%20female%20artist%20portrait%2C%20gentle%20and%20artistic%2C%20watercolor%20painting%20background&image_size=square',
    email: 'zhangmeiling@art.com',
    phone: '13700137000',
    artworks: ['3'],
    verified: true,
    createdAt: '2021-03-10T00:00:00Z'
  }
]

export const mockCategories: Category[] = [
  {
    id: '1',
    name: '国画',
    description: '中国传统绘画艺术',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Traditional%20Chinese%20painting%20style%2C%20ink%20wash%20landscape%2C%20elegant%20and%20classical&image_size=square',
    count: 45
  },
  {
    id: '2',
    name: '油画',
    description: '西方经典绘画艺术',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Oil%20painting%20style%2C%20classic%20and%20rich%20colors%2C%20artistic%20composition&image_size=square',
    count: 32
  },
  {
    id: '3',
    name: '水彩',
    description: '清新透明的水彩艺术',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Watercolor%20painting%20style%2C%20soft%20and%20transparent%20colors%2C%20delicate%20brushwork&image_size=square',
    count: 28
  },
  {
    id: '4',
    name: '雕塑',
    description: '立体造型艺术',
    image: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Sculpture%20art%2C%203D%20artwork%2C%20modern%20and%20abstract%20forms&image_size=square',
    count: 18
  }
]