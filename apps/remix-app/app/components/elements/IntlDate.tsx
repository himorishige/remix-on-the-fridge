import { useLocales } from '~/providers/LocaleProvider';

type IntlDateProps = {
  date: Date;
  timeZone?: string;
};

export const IntlDate = ({ date, timeZone }: IntlDateProps) => {
  const locales = useLocales();
  const isoString = date.toISOString();
  const formattedDate = new Intl.DateTimeFormat(locales, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZone,
  }).format(date);

  return (
    <time dateTime={isoString} suppressHydrationWarning={true}>
      {formattedDate}
    </time>
  );
};
