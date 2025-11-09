import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title: string;
  description: string;
  keywords: string;
  ogImage?: string;
  robots?: string;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  keywords,
  ogImage,
  robots,
}) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      <meta name='keywords' content={keywords} />
      {robots && <meta name='robots' content={robots} />}
      <meta property='og:title' content={title} />
      <meta property='og:description' content={description} />
      <meta
        property='og:image'
        content={ogImage || 'https://monexo.com/default-image.jpg'}
      />
      <meta property='og:type' content='website' />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={title} />
      <meta name='twitter:description' content={description} />
      <meta
        name='twitter:image'
        content={ogImage || 'https://monexo.com/default-image.jpg'}
      />
      <link rel='canonical' href={window.location.href} />
    </Helmet>
  );
};

export default Seo;
