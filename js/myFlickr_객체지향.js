//객체 지향으로 바꾸기
/*1. html <script>
		$(document).ready(()=>{
			new Flickr();
		})
	</script> 추가 
  */
/**
 * 2.class 만들고 contructor 만ㄷ르어요
 * 3.init 만들어서 전역변수 넣어줘요 this로 변경
 * 4.bindingEvent 안에 이벤트들 넣고
 * 5.함수들도 flicker 안에 넣고
 * 6. this 붙여주고 , 함수 arrow로 바꿔야함
 * 7. 함수도 앞에function 제거 함수 호출도this 붙이고
 * arrow function 안하면 bind 해줘야하는데 그게 내가 정한this 아니라서 arrow는 내가 정하 ㅅthis로 사용가능
html 기본 값 지정 $(document).ready(()=>{
			new Flickr('section',{			
				key: 'cf213181fbdb73a0ce6d71164837c0c8',
				num: 50
			});
		}) 
8. 객체 지향 옵션 값 전달 

*/
class Flickr {
  constructor(selector, opt) {
    if (!opt.key) {
      alert('key값은 필수 입력사항입니다.')
      return
    }
    let default_opt = {
      title: 'h1',
      gallery: '#gallery',
      search: '#searchBox',
      num: 100,
    }

    //받은 opt값을 default_opt에 덮어씌우기 init에 넣어줌
    let result_opt = { ...default_opt, ...opt }
    this.init(selector, result_opt)
    this.bindingEvent()
  }
  init(selector, result_opt) {
    this.frame = $(selector)
    this.h1 = this.frame.find(result_opt.title)
    this.gallery = this.frame.find(result_opt.gallery)
    this.searchBox = this.frame.find(result_opt.search)
    this.searchInput = this.searchBox.find('input')
    this.searchBtn = this.searchBox.find('button')
    this.key = result_opt.key
    this.num = result_opt.num
    this.url = 'https://www.flickr.com/services/rest'
    this.interest = 'flickr.interestingness.getList'
    this.user = 'flickr.people.getPhotos'
    this.search = 'flickr.photos.search'
  }
  bindingEvent() {
    //처음 로딩시 interest 데이터 호출
    this.getItems()

    //검색창에 검색어 입력후 클릭시

    //.bind(this) 이거 안해서 하루종일 검색 클릭하면 클릭 안되고
    //Cannot read properties of undefined (reading 'val') 뜨고
    this.searchBtn.on('click', this.getTags.bind(this))

    /*
  keypress : shift, alt, 한글입력시 미지원키 발생
  keydown : 키를 누르는 동안
  keyup : 키를 눌렀다가 떼는 순간
  
*/

    //enter해도 검색되게
    this.searchInput.on('keyup', (e) => {
      if (e.key === 'Enter') this.getTags()
    })

    //로고 클릭하면 다시 갤러리 리스트 초기화
    this.h1.on('click', () => {
      this.getItems()
    })

    //썸네일 클릭시 팝업 생성
    $('body').on('click', '#gallery ul li>.inner>a', (e) => {
      // 이거 왜 사용했지 ?
      e.preventDefault()
      $('body').css('overflow', 'hidden')
      const imgSrc = $(e.currentTarget).attr('href')

      $('body').append(
        $('<aside class="pop">').append(
          $('<img>').attr('src', imgSrc),
          $('<span>').text('close'),
        ),
      )

      $('.pop').fadeIn(1000)
    })

    //닫기 버튼 클릭시 팝업 제거
    $('body').on('click', '.pop span', () => {
      $('body').css('overflow', 'auto')
      $('.pop').fadeOut(1000, () => {
        $('.pop').remove()
      })
    })

    //사용자 아이디 클릭시 해당 사용자의 이미지만 호출
    $('body').on('click', '.profile span', (e) => {
      const user_id = $(e.currentTarget).text()
      this.getItems({
        user_id: user_id,
        method: this.user,
      })
    })
  }

  //ajax
  getItems(opt) {
    $(gallery.selector + ' ul').removeClass('loaded')
    $('.loading').removeClass('off')
    /*
  웹서버 API데이터 요청시 다양한 옵션값들을 기존 URL뒤에 문자열 형태로 전달하는 방식
  QueryString
  기본URL?키1=값1&키2=값2
  url?api_key=key&per_page=500
*/
    //ajax호출시 기본 쿼리 스트링 객체 설정
    let default_opt = {
      method: this.interest,
      api_key: this.key,
      per_page: this.num,
      format: 'json',
      nojsoncallback: 1,
    }
    //기존 객체에 사용자가 입력한 객체를 합쳐서
    let result_opt = { ...default_opt, ...opt }

    $.ajax({
      url: this.url,
      dataType: 'json',
      //ajax호출시 합친 객체쿼리를 전송
      data: result_opt,
    })
      .success((data) => {
        //이미지가 없으면 alert
        if (data.photos.photo.length === 0) {
          alert('검색결과가 없습니다.')
          this.getItems()
        } else {
          //지정한 최대 이미지 갯수보다 결과 이미지 갯수가 적으면
          //결과 이미지 갯수를 최대 이미지 갯수로 변경
          if (data.photos.photo.length < this.num)
            this.num = data.photos.photo.length
          this.crreateList(data.photos.photo)
          this.imgLoaded()
        }
      })
      .error((err) => {
        console.log(err)
      })
  }

  //갤러리 만드는 함수
  crreateList(items) {
    //.empty() 선택한 요소의 내용 지운다 태그는 남아 있다
    //.remove() 태그 포함한 요소 전체 제거
    this.gallery.empty()
    this.gallery.append('<ul>')
    //사용안하는 파라미터 $(items).each(function(_, data){    이렇게  언더바로 표현
    $(items).each((_, data) => {
      //title 없으면  저 text 나와요
      let text = data.title

      //삼항연산자로 title길이 50 넘으면  말줄임 사용
      text.length > 50 ? (text = text.substr(0, 50) + '...') : text
      if (!data.title) text = 'No description in this photo'

      this.gallery.find('ul').append(
        $('<li>').append(
          $('<div class="inner">').append(
            $('<a>')
              .attr(
                'href',
                `https://live.staticflickr.com/${data.server}/${data.id}_${data.secret}_b.jpg`,
              )
              .append(
                $('<img>').attr(
                  'src',
                  `https://live.staticflickr.com/${data.server}/${data.id}_${data.secret}_m.jpg`,
                ),
              ),
            $('<p>').text(text),
            $('<div class="profile">').append(
              $('<img>').attr(
                'src',
                `http://farm${data.farm}.staticflickr.com/${data.server}/buddyicons/${data.owner}.jpg`,
              ),
              $('<span>').text(data.owner),
            ),
          ),
        ),
      )
    })
  }
  //이미지 소스 로딩 완료시 레이아웃 적용 함수
  imgLoaded() {
    let imgNum = 0
    // 동적으로 완성된 img Dom 갯수만큼 반복을 돌면서 소스 이미지 에러가 나면 대체 이미지로 출력
    this.gallery.find(' li img').each((_, data) => {
      data.onerror = () => {
        $(data).attr('src', 'https://www.flickr.com/images/buddyicon.gif')
      }
      data.onload = () => {
        imgNum++
        //console.log(imgNum)
        if (imgNum === this.num * 2) {
          //isotope layout  적용
          //gallery.selector 이게 뭔데
          new Isotope(this.gallery.selector + ' ul', {
            itemSelector: this.gallery.selector + ' li',
            columnWidth: this.gallery.selector + ' li',
            transitionDuration: '0.5s',
          })
          //gallery frame 보이게 처리하고 로딩바 숨김
          $(this.gallery.selector + ' ul').addClass('loaded')
          $('.loading').addClass('off')
        }
      }
    })
  }

  //검색기능 함수
  getTags() {
    let inputs = this.searchInput.val()

    //양 끝 공백제거
    inputs = inputs.trim()
    //검색어 없고 공백이면 alert
    if (!inputs || inputs === '') {
      alert('검색어를 입력하세요')
      return
    }

    //복수개의 검색어 입력시 콤마로 구분해서 문자열로 변환후 옵션객체에 전달
    //여러개의 문자열로 나눠요  배열
    inputs = inputs.split(' ')
    //배열의 모든 요소 연결 하나의 문자열?
    inputs = inputs.join(',')
    console.log(inputs)

    this.searchInput.val('')

    //input의 val가 search 됨
    this.getItems({
      method: this.search,
      tags: inputs,
    })
  }
}
