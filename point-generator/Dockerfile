FROM python:3.7

WORKDIR /usr/src/app

RUN apt-get update && apt-get install libgeos-dev -y

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD [ "python", "./generator.py" ]
